define([
	'dojo/_base/declare',
	'dojo/promise/all'
], function (declare, whenAll) {
	function getFieldsFromColumns(grid) {
		var subRow = grid.subRows[0];
		return subRow.reduce(function (fields, column) {
			if (!column.hidden) {
				fields.push(column.field);
			}
			return fields;
		}, []);
	}

	function getFieldsFromColumnSets(grid) {
		// Flatten `columnSet` into a single array of column field names.
		return grid.columnSets.reduce(function (fields, columnSet) {
			// Each column set is an array of sub rows, and each sub row is an array of column objects.
			// We are interested only in the column objects, so we flatten all sub rows for the current
			// column set into a single array of column objects.
			var columns = columnSet.reduce(function (columns, subRow) {
				return columns.concat(subRow);
			}, []);

			// This is identical to the earlier functions that map column objects to their field names.
			var columnSetFields = columns.reduce(function (columnSetFields, column) {
				if (!column.hidden) {
					columnSetFields.push(column.field);
				}
				return columnSetFields;
			}, []);

			// Merge the field names for the current column set into the array containing all field names
			// for all column sets.
			return fields.concat(columnSetFields);
		}, []);
	}

	function getFields(grid) {
		if(grid.columnSets) {
			return getFieldsFromColumnSets(grid);
		}
		else {
			return getFieldsFromColumns(grid);
		}
	}

	return declare(null, {
		childrenProperty: '__children__',

		exportData: function () {
			var grid = this;
			var collection = this._renderedCollection;
			var isTree = Boolean(this._treeColumn && collection.mayHaveChildren);

			function processItems(items) {
				var fields = getFields(grid);

				// Reduce the store to an array containing only fields present in the
				// `fields` array created above, sorted by the order of the `fields` array.
				var visibleValues = items.map(function (item) {
					var result = Object.keys(item)
						.sort(function (a, b) {
							// If the current field name (`a`) comes before the next field name (`b`) in
							// the fields array above, then subtracting the index of `b` from the index of `a`
							// will be negative, which is exactly what `Array.prototype.sort` expects to
							// indicate that `a` should be ordered first. Any field name not found in `fields`
							// will be ordered at the beginning, but those fields are filtered out in the
							// reducer below.
							return fields.indexOf(a) - fields.indexOf(b);
						})
							.reduce(function (visible, key) {
								// Only include fields that are rendered in unhidden columns.
								if (fields.indexOf(key) > -1) {
									visible[key] = item[key];
								}
								return visible;
							}, {});

							if (isTree && collection.mayHaveChildren(item)) {
								var childCollection = collection.getChildren(item);
								if (grid.sort && grid.sort.length > 0) {
									childCollection = childCollection.sort(grid.sort);
								}
								return childCollection.fetch().then(processItems).then(function (items) {
									if (items.length) {
										result[grid.childrenProperty] = items;
									}
									return result;
								});
							}
							else {
								return result;
							}
				});

				return whenAll(visibleValues);
			}

			return collection.fetch().then(processItems);
		}
	});
});
