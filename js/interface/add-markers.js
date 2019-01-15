import Multiselect from 'vue-multiselect'

Fliplet.Floorplan.component('add-markers', {
  componentName: 'Add Markers',
  props: {
    id: {
      type: Number,
      default: undefined
    },
    widgetData: {
      type: Object,
      default: undefined
    },
    markersDataSource: {
      type: Object,
      default: undefined
    },
    markerNameColumn: {
      type: String,
      default: ''
    },
    markerFloorColumn: {
      type: String,
      default: ''
    },
    markerTypeColumn: {
      type: String,
      default: ''
    },
    markerXPositionColumn: {
      type: String,
      default: ''
    },
    markerYPositionColumn: {
      type: String,
      default: ''
    },
    dataSources: {
      type: Array,
      default: []
    },
    autoDataSource: {
      type: Boolean,
      default: false
    }
  },
  components: { Multiselect },
  data: () => {
    return {
      manualSelectDataSource: false
    }
  },
  computed: {
    markersDataSourceId() {
      return this.markersDataSource.id
    },
    markerFieldColumns() {
      return this.markersDataSource ? this.markersDataSource.columns : []
    },
    savedDataSource() {
      return this.widgetData.markersDataSourceId ? true : false
    }
  },
  watch: {
    markersDataSource(ds, oldDs) {
      if (!ds || !oldDs || ds.id !== oldDs.id) {
        // Resets select fields
        this.markerNameColumn = ''
        this.markerFloorColumn = ''
        this.markerTypeColumn = ''
        this.markerXPositionColumn = ''
        this.markerYPositionColumn = ''
      }
    }
  },
  methods: {
    nameWithId({ name, id }) {
      return `${name} — [${id}]`
    },
    createNewData() {
      const $vm = this
      const name = `${this.appName} - Markers`
      Fliplet.Modal.prompt({
        title: 'Please type a name for your data source:',
        value: name
      }).then((name) => {
        if (name === null || name === '') {
          return Promise.reject()
        }

        return name
      }).then((name) => {
        return Fliplet.DataSources.create({
          name: name,
          organizationId: organizationId
        })
      }).then((ds) => {
        $vm.dataSources.push(ds)
        $vm.selectedDataSource = ds.id
      })
    },
    chooseExistingData() {
      const $vm = this
      Fliplet.Modal.confirm({
        title: 'Changing data source',
        message: '<p>If you continue the data source we created for you will be deleted.</p><p>Are you sure you want to continue?</p>'
      }).then((result) => {
        if (!result) {
          return
        }

        return $vm.deleteDataSource()
      }).then(() => {
        // Remove from dataSources
        $vm.dataSources = _.filter($vm.dataSources, (ds) => {
          return ds.id !== $vm.markersDataSourceId
        })
        $vm.markersDataSource = null

        $vm.manualSelectDataSource = true
      }) 
    },
    editDataSource() {
      Fliplet.Studio.emit('overlay', {
        name: 'widget',
        options: {
          size: 'large',
          package: 'com.fliplet.data-sources',
          title: 'Edit Data Sources',
          classes: 'data-source-overlay',
          data: {
            context: 'overlay',
            dataSourceId: this.markersDataSourceId
          }
        }
      });
    },
    deleteDataSource() {
      return Fliplet.DataSources.delete(this.markersDataSourceId)
    },
    reloadDataSources() {
      return Fliplet.DataSources.get({
        roles: 'publisher,editor',
        type: null
      }, {
        cache: false
      })
    },
    saveData() {
      const markersData = _.pick(this, [
        'markersDataSource',
        'markersDataSourceId',
        'markerNameColumn',
        'markerFloorColumn',
        'markerTypeColumn',
        'markerXPositionColumn',
        'markerYPositionColumn'
      ])
      Fliplet.Floorplan.emit('add-markers-settings-changed', markersData)
    }
  },
  created() {
    const $vm = this
    Fliplet.Studio.onMessage((event) => {
      if (event.data && event.data.event === 'overlay-close' && event.data.data && event.data.data.dataSourceId) {
        $vm.reloadDataSources().then((dataSources) => {
          $vm.dataSources = dataSources
        })
      }
    })

    Fliplet.Floorplan.on('add-markers-save', this.saveData)
  },
  destroyed() {
    Fliplet.Floorplan.off('add-markers-save', this.saveData)
  }
});