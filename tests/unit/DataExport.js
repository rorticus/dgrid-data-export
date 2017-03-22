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
            var rows = [];
            for (var i = 0; i < (count || 25); i++) {
                rows.push({
                    id: i,
                    field1: 'field 1 ' + i,
                    field2: 'field 2 ' + i,
                    field3: 'field 3 ' + i
                });
            }

            for(i = 0; i < (count || 25); i++) {
                rows.push({
                    id: (count || 25) + i,
                    field1: 'sub row field 1 ' + i,
                    parent: i
                });
            }

            return new declare([Memory, TreeStore])({
                data: rows
            });
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

            'with Tree': function () {
                var Grid = declare([OnDemandGrid, DataExport, Tree]);
                var grid = new Grid({
                    collection: createTreeStore(2),
                    columns: [
                        { field: 'field1', label: 'field 1', renderExpando: true },
                        { field: 'field2', label: 'field 2' }
                    ]
                });

                return grid.exportData().then(function (data) {
                    console.log(data);
                    assert.deepEqual(data, [
                        {
                            field1: 'field 1 0',
                            field2: 'field 2 0'
                        },
                        {
                            field1: 'sub row field 1 0'
                        },
                        {
                            field1: 'field 1 1',
                            field2: 'field 2 1'
                        },
                        {
                            field1: 'sub row field 1 1'
                        }
                    ]);
                });
            }
        });
    });