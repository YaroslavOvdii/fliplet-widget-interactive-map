Fliplet().then(function () {
  Fliplet.Widget.instance('interactive-map', function(data) {
    var selector = '[data-interactive-map-id="' + data.id + '"]';

    const $interactiveMap = new Vue({
      el: $(selector)[0],
      data() {
        return {
          containsData: data.maps && data.maps.length && data.markers && data.markers.length,
          maps: data.maps && data.maps.length ? data.maps : [],
          markerStyles: data.markers && data.markers.length ? data.markers : [],
          markersDataSourceId: data.markersDataSourceId || undefined,
          markerNameColumn: data.markerNameColumn || undefined,
          markerMapColumn: data.markerMapColumn || undefined,
          markerTypeColumn: data.markerTypeColumn || undefined,
          markerXPositionColumn: data.markerXPositionColumn || undefined,
          markerYPositionColumn: data.markerYPositionColumn || undefined,
          markersData: undefined,
          mappedMarkerData: [],
          searchMarkerData: undefined,
          flPanZoomInstance: null,
          pzElement: undefined,
          pzHandler: undefined,
          markerElemHandler: undefined,
          activeMap: 0,
          activeMarker: 0,
          imageLoaded: false,
          selectedMapData: undefined,
          selectedMarkerData: undefined,
          selectedMarkerToggle: false,
          selectedPinchMarker: undefined,
          searchTimeout: null,
          searchValue: '',
          noSearchResults: false
        }
      },
      watch: {
        searchValue() {
          this.noSearchResults = false

          if (this.searchTimeout) {
            clearTimeout(this.searchTimeout)
            this.searchTimeout = null
          }
          this.searchTimeout = setTimeout(this.filterMarkers, 500)
        }
      },
      methods: {
        filterMarkers() {
          if (!this.searchValue) {
            this.searchMarkerData = _.cloneDeep(this.mappedMarkerData)
            return
          }

          this.searchMarkerData = _.filter(this.mappedMarkerData, (marker) => {
            return _.some(['name', 'map'], (key) => {
              return marker.data[key] && marker.data[key].toString().toLowerCase().indexOf(this.searchValue.toLowerCase()) > -1
            })
          })

          if (!this.searchMarkerData.length) {
            this.noSearchResults = true
          }
        },
        clearSearch() {
          this.searchValue = ''
        },
        mapMarkerData() {
          const newMarkerData = this.markersData.map((marker) => {
            const markerData = _.find(this.markerStyles, { name: marker.data[this.markerTypeColumn] })
            return {
              id: marker.id,
              data: {
                name: marker.data[this.markerNameColumn],
                map: marker.data[this.markerMapColumn],
                type: marker.data[this.markerTypeColumn],
                icon: markerData ? markerData.icon : '',
                color: markerData ? markerData.color : '#333333',
                size: markerData ? markerData.size : '24px',
                positionx: marker.data[this.markerXPositionColumn],
                positiony: marker.data[this.markerYPositionColumn]
              }
            }
          })

          return newMarkerData
        },
        setupFlPanZoom() {
          this.imageLoaded = false
          this.selectedMapData = this.maps[this.activeMap]
          this.selectedMarkerData = this.mappedMarkerData[this.activeMarker]
            ? this.mappedMarkerData[this.activeMarker].data
            : undefined
          this.selectedMarkerToggle = !!this.selectedMarkerData

          if (this.flPanZoomInstance) {
            this.flPanZoomInstance = null
          }

          this.pzElement = $('#map-' + this.selectedMapData.id)

          this.flPanZoomInstance = Fliplet.UI.PanZoom.create(this.pzElement, {
            maxZoom: 4,
            zoomStep: 0.25,
            animDuration: 0.1
          })

          this.flPanZoomInstance.on('mapImageLoaded', (e) => {
            this.imageLoaded = true
          })

          this.pzHandler = new Hammer(this.pzElement.get(0))

          if (this.mappedMarkerData.length) {
            this.addMarkers(true)
            this.selectPinchMarker()
          }
        },
        selectPinchMarker() {
          // Remove any active marker
          $('.marker').removeClass('active')
          // Get markers
          const markers = this.flPanZoomInstance.markers.getAll()
          // Store first marker
          const marker = markers[0]

          // Find the new selected marker from flPanZoomInstance
          this.selectedPinchMarker = _.find(markers, (marker) => {
            return marker.vars.id === this.mappedMarkerData[this.activeMarker].id
          })
          // Apply class active
          if (this.selectedPinchMarker) {
            $(this.selectedPinchMarker.getElement().get(0)).addClass('active')
          } else {
            this.activeMarker = _.findIndex(this.mappedMarkerData, (o) => { return o.id == marker.vars.id })
            this.selectedMarkerData = this.mappedMarkerData[this.activeMarker].data
            $(markers[0].getElement().get(0)).addClass('active')
          }
        },
        addMarkers(fromLoad, options) {
          this.flPanZoomInstance.markers.removeAll()

          this.mappedMarkerData.forEach((marker, index) => {
            if (marker.data.map === this.selectedMapData.name) {
              const markerElem = $("<div id='" + marker.id + "' class='marker' data-tooltip='" + marker.data.name + "' style='left: -15px; top: -15px; position: absolute; width: " + marker.data.size + "; height: " + marker.data.size + ";'><i class='" + marker.data.icon + "' style='color: " + marker.data.color + "; font-size: " + marker.data.size + ";'></i><div class='active-state' style='background-color: " + marker.data.color + ";'></div></div>")

              this.markerElemHandler = new Hammer(markerElem.get(0))
              this.flPanZoomInstance.markers.set([Fliplet.UI.PanZoom.Markers.create(markerElem, { x: marker.data.positionx, y: marker.data.positiony, name: marker.data.name, id: marker.id })])
              this.markerElemHandler.on('tap', this.onMarkerHandler)
            }
          })
        },
        onMarkerHandler(e) {
          const markers = this.flPanZoomInstance.markers.getAll()
          const id = $(e.target).attr('id')
          const marker = _.find(markers, (o) => { return o.vars.id == id })
          this.activeMarker = _.findIndex(this.mappedMarkerData, (o) => { return o.id == marker.vars.id })
          this.selectPinchMarker()
          this.selectedMarkerData = this.mappedMarkerData[this.activeMarker].data
          this.selectedMarkerToggle = true
        },
        setActiveMap(mapIndex, fromSearch) {
          if (this.activeMap !== mapIndex) {
            this.activeMap = mapIndex
          }

          if (!fromSearch) {
            this.setupFlPanZoom()
          }

          this.toggleMapOverlay(false)
        },
        setActiveMarker(markerIndex) {
          this.activeMarker = markerIndex
          this.setupFlPanZoom()
          this.toggleSearchOverlay(false)
        },
        selectedMarker(markerData) {
          const mapIndex = _.findIndex(this.maps, (o) => { return o.name == markerData.data.map })
          const markerIndex = _.findIndex(this.mappedMarkerData, (o) => { return o.data.name == markerData.data.name })

          this.setActiveMap(mapIndex, true)
          this.setActiveMarker(markerIndex)
        },
        selectMarkerOnStart() {
          let markerIndex = undefined

          if (!_.hasIn(this.startOnMarker, 'id') && !_.hasIn(this.startOnMarker, 'name')) {
            this.$nextTick(this.setupFlPanZoom)
            return
          }

          if (_.hasIn(this.startOnMarker, 'id')) {
            markerIndex = _.findIndex(this.mappedMarkerData, (o) => { return o.id == this.startOnMarker.id })
          }

          if (_.hasIn(this.startOnMarker, 'name')) {
            markerIndex = _.findIndex(this.mappedMarkerData, (o) => { return o.data.name == this.startOnMarker.name })
          }

          const mapName = this.mappedMarkerData[markerIndex].data.map
          const mapIndex = _.findIndex(this.maps, (o) => { return o.name == mapName })

          this.setActiveMap(mapIndex, true)
          this.setActiveMarker(markerIndex)
        },
        selectMapOnStart() {
          if (!_.hasIn(this.startOnMap, 'name')) {
            this.$nextTick(this.setupFlPanZoom)
            return
          }

          const mapIndex = _.findIndex(this.maps, (o) => { return o.name == this.startOnMap.name })
          this.setActiveMap(mapIndex)
        },
        removeSelectedMarker() {
          this.selectedMarkerToggle = false

          // Wait for animation
          setTimeout(() => {
            // Remove any active marker
            $('.marker').removeClass('active')
            this.selectedMarkerData = undefined
          }, 250)
        },
        closeMapsOverlay() {
          this.toggleMapOverlay(false)
        },
        toggleMapOverlay(forceOpen) {
          if (typeof forceOpen === 'undefined') {
            $(selector).find('.interactive-maps-overlay').toggleClass('overlay-open')
            return
          }
          
          $(selector).find('.interactive-maps-overlay')[forceOpen ? 'addClass' : 'removeClass']('overlay-open')
        },
        closeSearchOverlay() {
          this.toggleSearchOverlay(false)
        },
        toggleSearchOverlay(forceOpen) {
          this.searchValue = ''

          if (typeof forceOpen === 'undefined') {
            $(selector).find('.interactive-maps-search-overlay').toggleClass('overlay-open')
            return
          }
          
          $(selector).find('.interactive-maps-search-overlay')[forceOpen ? 'addClass' : 'removeClass']('overlay-open')
        },
        onLabelClick() {
          Fliplet.Hooks.run('flInteractiveMapOnLabelClick', {
            selectedMarker: this.selectedMarkerData,
            config: this,
            id: data.id,
            uuid: data.uuid,
            container: $(selector)
          }).then(() => {
            if (this.labelAction) {
              this.labelAction()
            }
          })
        },
        fetchData(options) {
          return Fliplet.DataSources.connect(this.markersDataSourceId, options)
            .then((connection) => {
              return connection.find()
            })
            .catch((error) => {
              Fliplet.UI.Toast({
                message: 'Error loading data',
                actions: [
                  {
                    label: 'Details',
                    action: function () {
                      Fliplet.UI.Toast({
                        html: error.message || error
                      });
                    }
                  }
                ]
              })
            })
        },
        init() {
          const cache = { offline: true }

          return Fliplet.Hooks.run('flInteractiveMapBeforeGetData', {
            config: this,
            id: data.id,
            uuid: data.uuid,
            container: $(selector)
          }).then(() => {
            if (this.getData) {
              this.fetchData = this.getData

              if (this.hasOwnProperty('cache')) {
                cache.offline = this.cache
              }
            }

            return this.fetchData(cache)
          }).then((data) => {
            this.markersData = data 
            this.mappedMarkerData = this.mapMarkerData()

            return Fliplet.Hooks.run('flInteractiveMapBeforeRenderMap', {
              config: this,
              id: data.id,
              uuid: data.uuid,
              container: $(selector)
            })
          }).then(() => {
            this.searchMarkerData = _.cloneDeep(this.mappedMarkerData)

            // Check if startOnMarker is set
            if (this.startOnMarker) {
              this.selectMarkerOnStart()
            } else if (this.startOnMap) {
              this.selectMapOnStart()
            } else {
              this.$nextTick(this.setupFlPanZoom)
            }
          })
        }
      },
      async mounted() {
        if (this.containsData) {
          await this.init()
        }

        $(selector).removeClass('is-loading')
      },
      beforeDestroy() {
        if (this.searchTimeout) {
          clearTimeout(this.searchTimeout)
          this.searchTimeout = null
        }
      }
    });
  })
});
