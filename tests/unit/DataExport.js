define([
    'intern!object',
    'intern/chai!assert',
    'dstore/Memory',
    'dstore/Tree',
    'src/DataExport',
    'dgrid/OnDemandGrid',
    'dojo/_base/declare',
    'dgrid/ColumnSet',
    'dgrid/extensions/ColumnReorder',
    'dgrid/extensions/ColumnHider',
    'dgrid/Tree'
], function (
    registerSuite,
    assert,
    Memory,
    TreeStore,
    DataExport,
    OnDemandGrid,
    declare,
    ColumnSet,
    ColumnReorder,
    ColumnHider,
    Tree
) {
        function createNormalStore(count) {
            var rows = [];
            for (var i = 0; i < (count || 25); i++) {
                rows.push({
                    id: i,
                    field1: 'field 1 ' + i,
                    field2: 'field 2 ' + i,
                    field3: 'field 3 ' + i
                });
            }

            return new Memory({
                data: rows
            });
        }

        function createTreeStore(count) {
            count = (count || 25);

            var rows = [];
            for (var i = 0; i < count; i++) {
                rows.push({
                    id: i,
                    field1: 'field 1 ' + i,
                    field2: 'field 2 ' + i,
                    field3: 'field 3 ' + i,
                    parent: null
                });
            }

            for(i = 0; i < (count - 1); i++) {
                for (var j = 0; j < 2; j++) {
                    var childId = count + (2 * i) + j;
                    rows.push({
                        id: childId,
                        field1: 'sub row field 1 ' + i + '-' + j,
                        parent: i
                    });
                }
            }

            return new declare([Memory, TreeStore])({
                data: rows
            });
        }

        function createTreeGrid(options) {
            options = options || {};

            var Grid = declare([OnDemandGrid, DataExport, Tree]);

            var collection = options.collection || createTreeStore(3).getRootCollection();
            var gridOptions = {
                collection: collection,
                columns: [
                    { field: 'field1', label: 'field 1', renderExpando: !options.skipExpando },
                    { field: 'field2', label: 'field 2' }
                ]
            };

            if (options.childrenProperty) {
                gridOptions.childrenProperty = options.childrenProperty;
            }
            if (options.sort) {
                gridOptions.sort = options.sort;
            }

            var grid = new Grid(gridOptions);
            grid.startup();

            return grid;
        }

        registerSuite({
            name: 'src/DataExport',

            'no plugins': function () {
                var Grid = declare([OnDemandGrid, DataExport]);
                var grid = new Grid({
                    collection: createNormalStore(2),
                    columns: [
                        { field: 'field1', label: 'field 1' },
                        { field: 'field2', label: 'field 2' }
                    ]
                });
                grid.startup();

                return grid.exportData().then(function (data) {
                    assert.deepEqual(data, [
                        {
                            field1: 'field 1 0',
                            field2: 'field 2 0'
                        },
                        {
                            field1: 'field 1 1',
                            field2: 'field 2 1'
                        }
                    ]);
                });
            },

            'with ColumnSet plugin': function () {
                var Grid = declare([OnDemandGrid, DataExport, ColumnSet]);
                var grid = new Grid({
                    collection: createNormalStore(2),
                    columnSets: [
                        [
                            [
                                { field: 'field2', label: 'field 2' }
                            ]
                        ],
                        [
                            [
                                { field: 'field1', label: 'field 1' }
                            ]
                        ]
                    ],
                });
                grid.startup();

                return grid.exportData().then(function (data) {
                    assert.deepEqual(data, [
                        {
                            field2: 'field 2 0',
                            field1: 'field 1 0'
                        },
                        {
                            field2: 'field 2 1',
                            field1: 'field 1 1'
                        }
                    ]);
                });
            },

            'with ColumnReorder plugin': function () {
                var Grid = declare([OnDemandGrid, DataExport, ColumnReorder]);
                var grid = new Grid({
                    collection: createNormalStore(2),
                    columns: [
                        { field: 'field1', label: 'field 1', order: 2 },
                        { field: 'field2', label: 'field 2', order: 1 }
                    ]
                });
                grid.startup();

                return grid.exportData().then(function (data) {
                    assert.deepEqual(data, [
                        {
                            field2: 'field 2 0',
                            field1: 'field 1 0'
                        },
                        {
                            field2: 'field 2 1',
                            field1: 'field 1 1'
                        }
                    ]);
                });
            },

            'with ColumnReorder/ColumnSets plugin': function () {
                var Grid = declare([OnDemandGrid, DataExport, ColumnReorder, ColumnSet]);
                var grid = new Grid({
                    collection: createNormalStore(2),
                    columnSets: [
                        [
                            [
                                { field: 'field1', label: 'field 1', order: 2 }
                            ],
                            [
                                { field: 'field2', label: 'field 2', order: 1 }
                            ]
                        ],
                        [
                            [
                                { field: 'field3', label: 'field 3' }
                            ]
                        ]
                    ],
                });
                grid.startup();

                return grid.exportData().then(function (data) {
                    assert.deepEqual(data, [
                        {
                            field2: 'field 2 0',
                            field1: 'field 1 0',
                            field3: 'field 3 0'
                        },
                        {
                            field2: 'field 2 1',
                            field1: 'field 1 1',
                            field3: 'field 3 1'
                        }
                    ]);
                });
            },

            'with ColumnHider': function () {
                var Grid = declare([OnDemandGrid, DataExport, ColumnHider]);
                var grid = new Grid({
                    collection: createNormalStore(2),
                    columns: [
                        { field: 'field1', label: 'field 1', hidden: true },
                        { field: 'field2', label: 'field 2' }
                    ]
                });
                grid.startup();

                return grid.exportData().then(function (data) {
                    assert.deepEqual(data, [
                        {
                            field2: 'field 2 0'
                        },
                        {
                            field2: 'field 2 1'
                        }
                    ]);
                });
            },

            'dgrid/Tree': {
                'basic': function () {
                    var grid = createTreeGrid();
                    return grid.exportData().then(function (data) {
                        assert.deepEqual(data, [
                            {
                                field1: 'field 1 0',
                                field2: 'field 2 0',
                                __children__: [
                                    {
                                        field1: 'sub row field 1 0-0'
                                    },
                                    {
                                        field1: 'sub row field 1 0-1'
                                    }
                                ]
                            },
                            {
                                field1: 'field 1 1',
                                field2: 'field 2 1',
                                __children__: [
                                    {
                                        field1: 'sub row field 1 1-0'
                                    },
                                    {
                                        field1: 'sub row field 1 1-1'
                                    }
                                ]
                            },
                            {
                                field1: 'field 1 2',
                                field2: 'field 2 2'
                            }
                        ]);
                    });
                },

                'sorted': function () {
                    var grid = createTreeGrid({ sort: [{ property: 'id', descending: true }] });
                    return grid.exportData().then(function (data) {
                        assert.deepEqual(data, [
                            {
                                field1: 'field 1 2',
                                field2: 'field 2 2'
                            },
                            {
                                field1: 'field 1 1',
                                field2: 'field 2 1',
                                __children__: [
                                    {
                                        field1: 'sub row field 1 1-1'
                                    },
                                    {
                                        field1: 'sub row field 1 1-0'
                                    }
                                ]
                            },
                            {
                                field1: 'field 1 0',
                                field2: 'field 2 0',
                                __children__: [
                                    {
                                        field1: 'sub row field 1 0-1'
                                    },
                                    {
                                        field1: 'sub row field 1 0-0'
                                    }
                                ]
                            }
                        ]);
                    });
                },
                'non-default childrenProperty': function () {
                    var grid = createTreeGrid({ childrenProperty: 'children' });
                    return grid.exportData().then(function (data) {
                        assert.deepEqual(data, [
                            {
                                field1: 'field 1 0',
                                field2: 'field 2 0',
                                children: [
                                    {
                                        field1: 'sub row field 1 0-0'
                                    },
                                    {
                                        field1: 'sub row field 1 0-1'
                                    }
                                ]
                            },
                            {
                                field1: 'field 1 1',
                                field2: 'field 2 1',
                                children: [
                                    {
                                        field1: 'sub row field 1 1-0'
                                    },
                                    {
                                        field1: 'sub row field 1 1-1'
                                    }
                                ]
                            },
                            {
                                field1: 'field 1 2',
                                field2: 'field 2 2'
                            }
                        ]);
                    });
                },

                'no expando': function () {
                    var grid = createTreeGrid({ skipExpando: true });
                    return grid.exportData().then(function (data) {
                        assert.deepEqual(data, [
                            {
                                field1: 'field 1 0',
                                field2: 'field 2 0'
                            },
                            {
                                field1: 'field 1 1',
                                field2: 'field 2 1'
                            },
                            {
                                field1: 'field 1 2',
                                field2: 'field 2 2'
                            }
                        ]);
                    });
                },

                'non-hierarchical collection': function () {
                    var grid = createTreeGrid({ collection: createNormalStore(3) });
                    return grid.exportData().then(function (data) {
                        assert.deepEqual(data, [
                            {
                                field1: 'field 1 0',
                                field2: 'field 2 0'
                            },
                            {
                                field1: 'field 1 1',
                                field2: 'field 2 1'
                            },
                            {
                                field1: 'field 1 2',
                                field2: 'field 2 2'
                            }
                        ]);
                    });
                },

                'non-hierarchical collection': function () {
                    var grid = createTreeGrid({ collection: createNormalStore(3) });
                    return grid.exportData().then(function (data) {
                        assert.deepEqual(data, [
                            {
                                field1: 'field 1 0',
                                field2: 'field 2 0'
                            },
                            {
                                field1: 'field 1 1',
                                field2: 'field 2 1'
                            },
                            {
                                field1: 'field 1 2',
                                field2: 'field 2 2'
                            }
                        ]);
                    });
                }
            }
        });
    });
