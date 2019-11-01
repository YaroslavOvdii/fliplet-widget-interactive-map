Fliplet.InteractiveMap.component('map-panel', {
  componentName: 'Map Panel',
  props: {
    id: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    image: {
      type: Object,
      default: undefined
    },
    error: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'map-panel'
    },
    isFromNew: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      updateDebounced: _.debounce(this.updateDataSource, 1000),
      widgetInstanceId: Fliplet.Widget.getDefaultId(),
      dataSourceId: Fliplet.Widget.getData().markersDataSourceId,
      entries: undefined,
      columns: undefined,
      dataSourceConnection: undefined,
      shouldKeepMarkers: false,
      imageWidth: undefined,
      imageHeight: undefined,
      oldMapName: ''
    }
  },
  methods: {
    saveToDataSource() {
     this.dataSourceConnection.commit(this.entries, this.columns)
     this.oldMapName = this.name
     Fliplet.Studio.emit('reload-widget-instance', this.widgetInstanceId)
   },
   getMapName() {
     this.oldMapName = this.name
   },
   updateDataSource() {
     Fliplet.DataSources.connect(this.dataSourceId).then(connection => {
       this.dataSourceConnection = connection
       connection.find({where: {['Map name']: this.oldMapName}}).then(records => {
         if (!records.length) {
           return
         }
         this.dataSourceConnection.find().then(records => {
            records.forEach((elem, index, array) => {
              if (elem.data['Map name'] === this.oldMapName) {
                array[index].data['Map name'] = this.name
              }
            })
            this.entries = records
            this.columns = _.keys(records[0].data)
            this.saveToDataSource()
          })
        })
      })
    },
    onInputData(imageSaved) {
      const componentData = _.pick(this, ['id', 'name', 'image', 'type', 'isFromNew'])
      Fliplet.InteractiveMap.emit('map-panel-settings-changed', componentData)
      if (imageSaved) {
        Fliplet.InteractiveMap.emit('new-map-added')
      }
    },
    openMapPicker() {
      Fliplet.DataSources.connect(this.dataSourceId).then(connection => {
        this.dataSourceConnection = connection
        connection.find({where: {['Map name']: this.name}}).then(records => {
          if (records.length) {
            Fliplet.Modal.confirm({
              title: 'Change image',
              message: 'Do you want to keep the existing markers?',
              buttons: {
                confirm: {
                  label: 'Keep the markers',
                  className: 'btn-success'
                },
                cancel: {
                  label: 'Delete the markers',
                  className: 'btn-danger'
                }
              }
            }).then(result => {
              if (result) {
                this.imageWidth = this.image.size[0]
               this.imageHeight = this.image.size[1]
               this.shouldKeepMarkers = true
               return
             }
             records.forEach(elem => {
               this.dataSourceConnection.removeById(elem.id)
             })
             Fliplet.Studio.emit('reload-widget-instance', this.widgetInstanceId)
           })
         }
       })
     })
      Fliplet.Widget.toggleCancelButton(false)

      const filePickerData = {
        selectFiles: this.image ? [this.image] : [],
        selectMultiple: false,
        type: 'image',
        fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF', 'SVG'],
        autoSelectOnUpload: true
      }

      window.filePickerProvider = Fliplet.Widget.open('com.fliplet.file-picker', {
        data: filePickerData,
        onEvent: (e, data) => {
          switch (e) {
            case 'widget-set-info':
              Fliplet.Studio.emit('widget-save-label-reset')
              Fliplet.Studio.emit('widget-save-label-update', {
                text: 'Select'
              })
              Fliplet.Widget.toggleSaveButton(!!data.length)
              break
          }
        }
      })

      window.filePickerProvider.then(result => {
       if (this.shouldKeepMarkers) {
         let newImageWidth = result.data[0].size[0]
         let newImageHeight = result.data[0].size[1]

          if (newImageWidth !== this.imageWidth && newImageHeight !== this.imageHeight) {
            let widthRatioDifference = newImageWidth/this.imageWidth
            let heightRatioDifference = newImageHeight/this.imageHeight

            this.dataSourceConnection.find().then(records => {
              records.forEach((elem, index, array) => {
                if (elem.data['Map name'] === this.name) {
                  array[index].data['Position X'] *= widthRatioDifference
                  array[index].data['Position Y'] *= heightRatioDifference
                }
              })
              this.entries = records
              this.columns = _.keys(records[0].data)
              this.saveToDataSource()
           })
         }
       }
       
        Fliplet.Widget.toggleCancelButton(true)
        let imageUrl = result.data[0].url
        const pattern = /[?&]size=/

        if (!pattern.test(imageUrl)) {
          const params = imageUrl.substring(1).split('?');
          imageUrl += (params.length > 1 ? '&' : '?') + 'size=large'
        }

        result.data[0].url = imageUrl
        this.image = result.data[0]
        this.onInputData(true)
        window.filePickerProvider = null
        Fliplet.Studio.emit('widget-save-label-reset')
        return Promise.resolve()
      })
    }
  },
  created() {
    Fliplet.InteractiveMap.on('maps-save', this.onInputData)
  },
  destroyed() {
    Fliplet.InteractiveMap.off('maps-save', this.onInputData)
  }
})

Fliplet.Widget.onCancelRequest(function () {
  var providersNames = [
    'filePickerProvider',
    'iconPickerProvider'
  ]

  _.each(providersNames, function (providerName) {
    if (window[providerName]) {
      window[providerName].close()
      window[providerName] = null
    }
  })

  Fliplet.Widget.toggleSaveButton(true)
  Fliplet.Widget.toggleCancelButton(true)
  Fliplet.Studio.emit('widget-save-label-reset')
})
