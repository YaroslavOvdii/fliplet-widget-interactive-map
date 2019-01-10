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
      floors: widgetData.floors || []
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
    onAdd(event) {
      const newItem = {
        id: this.makeid(8),
        isFromNew: true,
        name: `Floor ${this.floors.length + 1}`
      }

      this.floors.push(newItem);
    },
    onSort(event) {
      this.floors.splice(event.newIndex, 0, this.floors.splice(event.oldIndex, 1)[0]);
    },
    deleteField(index) {
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
    openFilePicker(item) {
      const $vm = this
      const filePickerData = {
        selectFiles: item.image ? [item.image] : [],
        selectMultiple: false,
        type: 'image',
        fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF'],
        autoSelectOnUpload: true
      }

      $vm.filePickerProvider = Fliplet.Widget.open('com.fliplet.file-picker', {
        data: filePickerData,
        onEvent: (e, data) => {
          switch (e) {
            case 'widget-set-info':
              Fliplet.Studio.emit('widget-save-label-reset')
              Fliplet.Studio.emit('widget-save-label-update', {
                text: 'Select'
              })
              Fliplet.Widget.toggleSaveButton(!!data.length)
              var msg = data.length ? data.length + ' folder selected' : 'no selected folders'
              Fliplet.Widget.info(msg)
              break
          }
        }
      })

      $vm.filePickerProvider.then((result) => {
        Fliplet.Widget.info('')
        item.image = result.data[0]
        item.mediaFolderNavStack = result.data[0].navStackRef || {}
        $vm.floors.forEach((panel, index) => {
          if (item.id === panel.id) {
            // To overcome the array change caveat
            // https://vuejs.org/v2/guide/list.html#Caveats
            Vue.set($vm.floors, index, item)
          }
        })
        $vm.filePickerProvider = null
        Fliplet.Studio.emit('widget-save-label-reset');
        return Promise.resolve();
      })
    },
    prepareToSaveData() {
      const newSettings = {
        floors: this.floors
      }

      this.settings = _.assignIn(this.settings, newSettings);

      this.saveData()
    },
    saveData() {
      Fliplet.Widget.save(this.settings)
        .then(function() {
          Fliplet.Widget.complete();
          Fliplet.Studio.emit('reload-widget-instance', widgetId);
        })
    }
  },
  async created() {
    const $vm = this
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
      if ($vm.filePickerProvider) {
        $vm.filePickerProvider.forwardSaveRequest()
      } else {
        $vm.prepareToSaveData()
      }
    })
  }
})