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
    type: {
      type: String,
      default: 'map-panel'
    },
    isFromNew: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    onInputData(imageSaved) {
      const componentData = _.pick(this, ['id', 'name', 'image', 'type', 'isFromNew'])
      Fliplet.InteractiveMap.emit('map-panel-settings-changed', componentData)
      if (imageSaved) {
        Fliplet.InteractiveMap.emit('new-map-added')
      }
    },
    openMapPicker() {
      Fliplet.Widget.toggleCancelButton(false);

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

      window.filePickerProvider.then((result) => {
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
});

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