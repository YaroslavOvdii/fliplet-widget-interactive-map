Fliplet.Floorplan.component('floor-panel', {
  componentName: 'Floor Panel',
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
      default: 'floor-panel'
    },
    isFromNew: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    onInputData() {
      const componentData = _.pick(this, ['id', 'name', 'image', 'type', 'isFromNew'])
      Fliplet.Floorplan.emit('floor-panel-settings-changed', componentData)
    },
    openFloorPicker() {
      const filePickerData = {
        selectFiles: this.image ? [this.image] : [],
        selectMultiple: false,
        type: 'image',
        fileExtension: ['JPG', 'JPEG', 'PNG', 'GIF', 'TIFF'],
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
        this.image = result.data[0]
        this.onInputData()
        window.filePickerProvider = null
        Fliplet.Studio.emit('widget-save-label-reset')
        return Promise.resolve()
      })
    }
  },
  created() {
    Fliplet.Floorplan.on('floors-save', this.onInputData)
  },
  destroyed() {
    Fliplet.Floorplan.off('floors-save', this.onInputData)
  }
});