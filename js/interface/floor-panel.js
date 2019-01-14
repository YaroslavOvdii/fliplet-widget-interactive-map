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
    onChangeData() {
      const componentData = _.pick(this, ['id', 'name', 'image', 'type', 'isFromNew'])
      Fliplet.Floorplan.emit('floor-panel-settings-changed', componentData)
    },
    openFloorPicker() {
      const $vm = this
      const filePickerData = {
        selectFiles: $vm.image ? [$vm.image] : [],
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
        $vm.image = result.data[0]
        $vm.onChangeData()
        window.filePickerProvider = null
        Fliplet.Studio.emit('widget-save-label-reset');
        return Promise.resolve();
      })
    }
  }
});