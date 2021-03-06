
/**
 *  Header table view options menu
 *  
 *  It needs a visualization model + account config data.
 *
 *  var options_menu = new cdb.admin.HeaderOptionsMenu({
 *    target:         $(a),
 *    model:          vis_model,
 *    username:       'username',
 *    geocoder:       geocoder,
 *    template_base: 'table/header/views/options_menu'
 *  })
 *
 */


cdb.admin.HeaderOptionsMenu = cdb.admin.DropdownMenu.extend({
  
  _TEXTS: {
    error: _t('Something went wrong, try again later')
  },

  events: {
    'click .export_table':    '_exportTable',
    'click .duplicate_table': '_duplicateTable',
    'click .append_data':     '_appendData',
    'click .delete_table':    '_deleteTable',
    'click .georeference':    '_georeference',
    'click .merge_tables':    '_mergeTables',
    'click .duplicate_vis':   '_duplicateVis',
    'click .delete_vis':      '_deleteVis'
  },

  render: function() {
    var opts = this.options;
    this.table = this.model.map.layers && this.model.map.layers.last().table;
    this.dataLayer = this.options.dataLayer;
    opts.isVisualization = this.model.isVisualization();
    opts.table = this.table;
    opts.dataLayer = this.options.dataLayer;

    this.$el
      .html(this.template_base(opts))
      .css({
        width: this.options.width
      });

    return this;
  },

  show: function() {
    this.render();
    this.constructor.__super__.show.apply(this);
  },

  /**
   *  Export a table
   */
  _exportTable: function(e){
    e.preventDefault();

    if (!this.model.isVisualization()) {

      // If a sql is applied but it is not valid, don't let user export it
      if (this.table.isInSQLView() && this.dataLayer && !this.dataLayer.get('query')) return false;

      var export_dialog = new cdb.admin.ExportTableDialog({
        model: this.table,
        config: config,
        user_data: user_data
      });

      export_dialog
        .appendToBody()
        .open();
    }
  },

  /**
   *  Duplicate table
   */
  _duplicateTable: function(e){
    e.preventDefault();

    if (!this.model.isVisualization()) {
      var duplicate_dialog = new cdb.admin.DuplicateTableDialog({
        model: this.table
      });

      duplicate_dialog
        .appendToBody()
        .open();
    }
  },

  /**
   *  Append data to a table (disabled for the moment :( )
   */
  _appendData: function(e){
    e.preventDefault();
  },

  /**
   *  Delete a table
   */
  _deleteTable: function(e){
    e.preventDefault();

    if (!this.model.isVisualization()) {
      this.delete_dialog = new cdb.admin.DeleteDialog({
        model: this.table,
        config: config,
        user_data: user_data,
      });
      $("body").append(this.delete_dialog.render().el);
      this.delete_dialog.open();

      var self = this;
      this.delete_dialog.ok = function() {
        self.model.destroy({
          success: function() {
            window.location.href = "/dashboard/"
          }
        });
      };
    }
  },

  /**
   *  Merge tables option
   */
  _mergeTables: function(e) {
    e.preventDefault();

    if (!this.model.isVisualization()) {
      var mergeDialog = new cdb.admin.MergeTablesDialog({
        table: this.table
      });

      mergeDialog
        .appendToBody()
        .open({ center:true });
    }
  },

  /**
   *  Georeference table data
   */
  _georeference: function(e) {
    e.preventDefault();

    if (!this.model.isVisualization()) {
      var geoDialog = new cdb.admin.GeoreferenceDialog({
        model: this.table,
        geocoder: this.options.geocoder
      });
      geoDialog
        .appendToBody()
        .open({ center:true });
    }
  },

  /**
   *  Duplicate a visualization
   */
  _duplicateVis: function(e) {
    e.preventDefault();

    if (this.model.isVisualization()) {
      var duplicate_dialog = new cdb.admin.DuplicateVisDialog({ model: this.model });

      duplicate_dialog
        .appendToBody()
        .open();
    }
  },

  /**
   *  Delete a visualization
   */
  _deleteVis: function(e) {
    e.preventDefault();
    
    if (this.model.isVisualization()) {
      var self = this;
      var dlg = new cdb.admin.DeleteVisualizationDialog();

      dlg
        .appendToBody()
        .open();

      dlg.ok = function() {
        self.model.destroy({
          success: function() {
            window.location.href = "/dashboard/"
          },
          error: function() {
            self.options.globalError.showError(self._TEXTS.error, 'info', 3000);         
          }
        });
      }
    }
  }
});