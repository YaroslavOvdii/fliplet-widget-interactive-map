const widgetId = parseInt(Fliplet.Widget.getDefaultId(), 10)
const widgetData = Fliplet.Widget.getData(widgetId) || {}
console.log('DATA', widgetData)

import * as Sortable from 'sortablejs/Sortable.js'

Vue.directive('sortable', {
  inserted(el, binding) {
    if (Sortable) {
      new Sortable(el, binding.value || {})
    }
  }
});

const selector = '#flooplan-app'

const app = new Vue({
  el: selector,
  data: () => {
    return {
      dataSources: [],
      filePickerProvider: null,
      floorPanelsIsEmpty: true,
      settings: widgetData,
      floors: widgetData.floors || [],
      markers: widgetData.markers || []
    }
  },
  methods: {
    makeid(length) {
      let text = ''
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

      for (let i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length))

      return text
    },
    loadDataSources() {
      return Fliplet.DataSources.get({
        roles: 'publisher,editor',
        type: null
      }, {
        cache: false
      })
    },
    onAddFloor() {
      const newItem = {
        id: this.makeid(8),
        isFromNew: true,
        name: `Floor ${this.floors.length + 1}`,
        type: 'floor-panel'
      }

      this.floors.push(newItem);
    },
    onSortFloors(event) {
      this.floors.splice(event.newIndex, 0, this.floors.splice(event.oldIndex, 1)[0]);
    },
    deleteFloor(index) {
      const $vm = this

      Fliplet.Modal.confirm({
        title: 'Delete floorplan',
        message: '<p>Are you sure you want to delete this floor?</p>'
      }).then(function (result) {
        if (!result) {
          return;
        }

        $vm.floors.splice(index, 1);
      });
    },
    onAddMarker() {
      const newItem = {
        id: this.makeid(8),
        isFromNew: true,
        name: `Marker ${this.markers.length + 1}`,
        icon: '',
        color: '#333333',
        type: 'marker-panel'
      }

      this.markers.push(newItem);
    },
    deleteMarker(index) {
      const $vm = this

      Fliplet.Modal.confirm({
        title: 'Delete floorplan',
        message: '<p>Are you sure you want to delete this floor?</p>'
      }).then(function (result) {
        if (!result) {
          return;
        }

        $vm.markers.splice(index, 1);
      });
    },
    onPanelSettingChanged(panelData) {
      this.floors.forEach((panel, index) => {
        if (panelData.id === panel.id) {
          // To overcome the array change caveat
          // https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(this.floors, index, panelData)
        }
      })
    },
    onMarkerPanelSettingChanged(panelData) {
      this.markers.forEach((panel, index) => {
        if (panelData.id === panel.id) {
          // To overcome the array change caveat
          // https://vuejs.org/v2/guide/list.html#Caveats
          Vue.set(this.markers, index, panelData)
        }
      })
    },
    prepareToSaveData() {
      // Mark 'isFromNew' as false
      this.floors.forEach((floor) => {
        floor.isFromNew = false
      })
      this.markers.forEach((marker) => {
        marker.isFromNew = false
      })

      const newSettings = {
        floors: this.floors,
        markers: this.markers
      }

      this.settings = _.assignIn(this.settings, newSettings);

      this.saveData()
    },
    saveData() {
      Fliplet.Widget.save(this.settings)
        .then(function() {
          Fliplet.Widget.complete();
        })
    }
  },
  async created() {
    const $vm = this

    Fliplet.Floorplan.on('floor-panel-settings-changed', this.onPanelSettingChanged)
    Fliplet.Floorplan.on('marker-panel-settings-changed', this.onMarkerPanelSettingChanged)

    // Gets the list of data sources
    this.dataSources = await this.loadDataSources()

    // Switches UI to ready state
    $(selector).removeClass('is-loading')

    Fliplet.Studio.onMessage((event) => {
      if (event.data
        && event.data.event === 'overlay-close'
        && event.data.data
        && event.data.data.dataSourceId) {
        $vm.loadDataSources()
      }
    })

    Fliplet.Widget.onSaveRequest(function() {
      if (window.filePickerProvider) {
        window.filePickerProvider.forwardSaveRequest()
        return
      }

      if (window.iconPickerProvider) {
        window.iconPickerProvider.forwardSaveRequest()
        return
      }

      $vm.prepareToSaveData()
    })
  },
  destroyed() {
    Fliplet.Floorplan.off('floor-panel-settings-changed', this.onPanelSettingChanged)
    Fliplet.Floorplan.off('marker-panel-settings-changed', this.onMarkerPanelSettingChanged)
  }
});