
describe("admin table", function() {

  describe("cbd.admin.Column", function() {
      var column;
      beforeEach(function() {
        var table = new cdb.admin.CartoDBTableMetadata({
          name: 'testTable'
        });
        column = new cdb.admin.Column({
          table: table,
          name: 'columnName'
        });
      });

      it("should have correct url", function() {
        expect(column.url()).toEqual(
          '/api/v1/tables/testTable/columns/columnName'
        );
      });
  });

  describe("cbd.admin.CartoDBTableMetadata", function() {
    var table;
    beforeEach(function() {
      table = new cdb.admin.CartoDBTableMetadata({
        name: 'testTable',
        schema: [
          ['test', 'string'],
          ['test2', 'number']
        ]
      });
    });

    it("should create column types", function() {
      expect(table._getColumn('test').get('type')).toEqual('string');
      expect(table._getColumn('test2').get('type')).toEqual('number');
      table.set({ schema:[
          ['test', 'number'],
          ['test2', 'number']
        ]
      });
      expect(table._getColumn('test').get('type')).toEqual('number');
    });

    it("altertable", function() {
      expect(table.alterTable('select * from blba')).toEqual(false);
      expect(table.alterTable('alter table add column blbla')).toEqual(true);
      expect(table.alterTable('update aaa set a = 1')).toEqual(false);
      expect(table.alterTable('insert into blaba values (1,2,3,4)')).toEqual(false);
      expect(table.alterTable('delete from bkna')).toEqual(false);
    });

    it("altertabledata", function() {
      expect(table.alterTableData('select * from blba')).toEqual(false);
      expect(table.alterTableData('update aaa set a = 1')).toEqual(true);
      expect(table.alterTableData('alter table add column blbla')).toEqual(true);
      expect(table.alterTableData('insert into blaba values (1,2,3,4)')).toEqual(true);
      expect(table.alterTableData('delete from bkna')).toEqual(true);
    });

    it("should change schema when a sqlview is applied", function() {
      var sqlView = new cdb.admin.SQLViewData(null, { sql: 'select * from a' });
      table.useSQLView(sqlView);
      sqlView.reset([
        { a: 1, b:2 }
      ]);

      expect(table.get('schema')).toEqual([
        ['a', 'undefined'],
        ['b', 'undefined']
      ]);
      /*expect(table._data.models[0].attributes).toEqual(
        { a: 1, b:2 }
      );*/
      //spyOn(table._data, 'fetch');
      //expect(table._data.fetch).toHaveBeenCalled();
    });
    it("should change schema when a sqlview is reset", function() {
      var sqlView = new cdb.admin.SQLViewData(null, { sql: 'select * from a' });
      table.useSQLView(sqlView);
      sqlView.reset([
        { a: 1, b:2 }
      ]);
      spyOn(table, 'fetch');
      expect(sqlView.table).toEqual(table);
      table.useSQLView(null);
      expect(table.fetch).toHaveBeenCalled();
      expect(sqlView.table).toEqual(null);
    });

    it("should fecth the table metadata when the sql applied modifies the table", function() {
      var sqlView = new cdb.admin.SQLViewData(null, { sql: 'select * from a' });
      table.useSQLView(sqlView);
      spyOn(table, 'fetch');
      sqlView.modify_rows = true;
      sqlView.reset([
        { a: 1, b:2 }
      ]);
      expect(table.fetch).toHaveBeenCalled();
    });

    it("it should return a row", function() {
        var r = table.data().getRow(1234);
        expect(r.id).toEqual(1234);
    });

    it("should be able to link to infowindow", function() {
      info = new cdb.geo.ui.InfowindowModel();
      info.addField('test').addField('test2');
      table.linkToInfowindow(info);
      table.trigger('columnRename', 'test', 'tt');
      expect(info.containsField('test')).toEqual(false);
      expect(info.containsField('tt')).toEqual(true);
      table.trigger('columnRename', 'tt');
      expect(info.containsField('tt')).toEqual(false);
    });

    it("should return default sql", function() {
      expect(table.data().getSQL()).toEqual('select * from testTable');

    });

  });

  describe("cbd.admin.Tables", function() {
    var tables;

    beforeEach(function() {
      tables = new cdb.admin.Tables();
    });

    it("the model should be Table", function() {
      expect(tables.model).toEqual(cdb.admin.CartoDBTableMetadata);
    });
  });

  describe("cbd.admin.CartoDBTableData", function() {
    var table;
    var tableData;

    beforeEach(function() {

      table = new cdb.admin.CartoDBTableMetadata({
        name: 'testTable',
        schema: [
          ['test', 'string'],
          ['test2', 'number']
        ]
      });

      tableData = new cdb.admin.CartoDBTableData(null, {
        table: table
      });
    });

    it("should add params to the url", function() {
      expect(tableData.url().indexOf('rows_per_page=40')).not.toEqual(-1);
    });

    it("should call fetch when options change", function() {
      spyOn(tableData, 'fetch');
      tableData.setPage(1);
      //expect(tableData.url().indexOf('page=1')).not.toEqual(-1);
      expect(tableData.fetch).toHaveBeenCalled();
    });

  });

  describe("cbd.admin.SQLViewData", function() {

    var sqlView;

    beforeEach(function() {
      sqlView = new cdb.admin.SQLViewData(null, { sql: 'select * from a' });
    });

    it("should generate schema from data", function() {
      expect(sqlView.schemaFromData()).toEqual([]);
      sqlView.reset([
        {a: 1, b: 2}
      ]);
      expect(sqlView.schemaFromData()).toEqual([
        ['a', 'undefined'],
        ['b', 'undefined']
      ]);

    });
  });


  describe("Tables", function() {
    var tables;

    beforeEach(function() {
      tables = new cdb.admin.Tables();
    });

    it("should fetch when request a page", function() {
      spyOn(tables, 'fetch');
      tables.options.set({page:2});
      expect(tables.fetch).toHaveBeenCalled();
    });

    it("should know the number of pages", function() {
      tables.total_entries = 22;
      expect(tables.getTotalPages()).toEqual(3);
    });

  });

});