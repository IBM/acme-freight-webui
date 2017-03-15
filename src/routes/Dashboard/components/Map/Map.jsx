import React from 'react';
import { connect } from 'react-redux';
import GoogleMap from 'google-map-react';
import RaisedButton from 'material-ui/RaisedButton';
import { simulateStorm, selectMarker } from 'routes/Dashboard/modules/Dashboard';
import MapMarker from './MapMarker/';
import AlertsCard from '../AlertsCard';
import LoadingSpinner from 'components/LoadingSpinner';
// map style from https://snazzymaps.com/style/151/ultra-light-with-labels
// https://googlemaps.github.io/js-samples/styledmaps/wizard/
import mapStyle from './Map.style.json';
import classes from './Map.scss';
import PopUpCard from './PopUpCard';

function createMapOptions(maps) {
  // Available options can be found in
  // https://github.com/istarkov/google-map-react-examples/blob/master/web/flux/components/examples/x_options/options_map_page.jsx
  return {
    zoomControlOptions: {
      position: maps.ControlPosition.RIGHT_CENTER,
      style: maps.ZoomControlStyle.SMALL,
    },
    mapTypeControlOptions: {
      position: maps.ControlPosition.TOP_RIGHT,
    },
    mapTypeControl: false,
    styles: mapStyle,
  };
}

export class Map extends React.PureComponent {

  constructor(props) {
    super(props);
    // this makes sure "this" in onMapChange is correctly bound to "this component"
    // https://medium.com/@goatslacker/react-0-13-x-and-autobinding-b4906189425d#.id09n9obh
    // http://babeljs.io/blog/2015/06/07/react-on-es6-plus
    this.onMapChange = this.onMapChange.bind(this);
  }

  componentWillMount() {
    this.setState({ zoom: this.props.zoom });
    const intervalId = setInterval(this.timer.bind(this), 500);
    this.setState({ intervalId });
  }

  componentWillUnmount() {
   // use intervalId from the state to clear the interval
   clearInterval(this.state.intervalId);
}

  onMapChange(change) {
    this.setState({ zoom: change.zoom });
  }

//Last minute animation requirement for IC Demo.
//TODO: remove this timer.
  timer() {
    this.props.shipments
      .map((shipment, index) => {
        if (shipment.currentLocation != null
         && shipment.status === 'TRANSIT_ANIMATION') {
          let change = false;
          if (shipment.currentLocation.longitude < -71.05) {
            this.props.shipments[index].currentLocation.longitude
            = shipment.currentLocation.longitude + 2;
            change = true;
          }
          if (shipment.currentLocation.latitude > 42.36) {
            this.props.shipments[index].currentLocation.latitude
            = shipment.currentLocation.latitude - 1;
            change = true;
          }
          if (change) {
            this.forceUpdate();
          }
          else {
            this.props.shipments[index].status = 'DELIVERED';
            this.props.shipments[index].currentLocation.city = 'Boston';
            this.props.shipments[index].currentLocation.state = 'MA';
            clearInterval(this.state.intervalId);
            this.props.selectMarker('shipment', this.props.shipments[index]);
            this.forceUpdate();
          }
        }
      });
  }

  isSelected(targetType, targetId) {
    return this.props.selectedMarker &&
      this.props.selectedMarker.type === targetType &&
      this.props.selectedMarker.data.id === targetId;
  }

  render() {
    // a button to simulate a storm
    // or a progress or nothing
    let simulate = '';
    if (this.props.mapLoading) {
      simulate = (<div className={classes.simulateLoading}>
        <LoadingSpinner size={64} />
      </div>);
    }
    else if (this.props.storms.length === 0) {
      simulate = (<RaisedButton
        onClick={this.props.simulateStorm}
        className={classes.simulateButton}
        label="Simulate Storm"
        id="simulateStorm"
      />);
    }




    return (
      <div className={classes.mapContainer}>
        <div className={classes.map}>
          <PopUpCard />
          <GoogleMap
            bootstrapURLKeys={{ key: __GOOGLE_MAPS_KEY__ }}
            center={this.props.center}
            zoom={this.props.zoom}
            options={createMapOptions}
            onChange={this.onMapChange}
          >
            {this.props.distributionCenters.map((dc, index) =>
              <MapMarker
                type="distributionCenter"
                text={dc.address.city}
                lat={dc.address.latitude}
                lng={dc.address.longitude}
                selectMarker={this.props.selectMarker}
                data={dc}
                key={dc.id}
                id={`distributionCenter-${index}`}
                zoom={this.state.zoom}
                selected={this.isSelected('distributionCenter', dc.id)}
              />
            )}
            {this.props.shipments
              .filter(shipment => (shipment.currentLocation != null))
              .map((shipment, index) =>
                <MapMarker
                  type="shipment"
                  lat={shipment.currentLocation.latitude}
                  lng={shipment.currentLocation.longitude}
                  key={shipment.id}
                  id={`shipment-${index}`}
                  selectMarker={this.props.selectMarker}
                  data={shipment}
                  zoom={this.state.zoom}
                  selected={this.isSelected('shipment', shipment.id)}
                />
              )}
            {this.props.retailers.map((retailer, index) =>
              <MapMarker
                type="retailer"
                lat={retailer.address.latitude}
                lng={retailer.address.longitude}
                key={retailer.id}
                id={`retailer-${index}`}
                selectMarker={this.props.selectMarker}
                data={retailer}
                zoom={this.state.zoom}
                selected={this.isSelected('retailer', retailer.id)}
              />
            )}
            {this.props.storms.map((storm, index) =>
              <MapMarker
                type="storm"
                lat={storm.event.lat}
                lng={storm.event.lon}
                key={index}
                id={`storm-${index}`}
                selectMarker={this.props.selectMarker}
                data={storm}
                zoom={this.state.zoom}
              />
            )}
          </GoogleMap>
          <AlertsCard />
          {simulate}
        </div>
      </div>);
  }
}

Map.propTypes = {
  selectMarker: React.PropTypes.func.isRequired,
  center: React.PropTypes.array,
  zoom: React.PropTypes.number,
  distributionCenters: React.PropTypes.array,
  shipments: React.PropTypes.array,
  retailers: React.PropTypes.array,
  storms: React.PropTypes.array,
  simulateStorm: React.PropTypes.func.isRequired,
  selectedMarker: React.PropTypes.object,
  mapLoading: React.PropTypes.bool,
};

Map.defaultProps = {
  center: [
    39.787232, -100.198712,
  ],
  zoom: 4,
  distributionCenters: [],
  shipments: [],
  retailers: [],
  storms: [],
};

// ------------------------------------
// Connect Component to Redux
// ------------------------------------

const mapActionCreators = {
  simulateStorm,
  selectMarker,
};

const mapStateToProps = (state) => ({
  shipments: state.dashboard.shipments,
  retailers: state.dashboard.retailers,
  distributionCenters: state.dashboard['distribution-centers'],
  storms: state.dashboard.storms,
  selectedMarker: state.dashboard.infoBox,
  mapLoading: state.dashboard.mapLoading,
});

export default connect(mapStateToProps, mapActionCreators)(Map);
