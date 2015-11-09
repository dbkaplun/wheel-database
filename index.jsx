var React = require('react');
var ReactDOM = require('react-dom');
var Reactable = require('reactable');
var $ = require('jquery');

var WheelDatabase = React.createClass({
  getInitialState: function () {
    return {
      wheels: [],
      wheelOptions: {},
      selectedWheelOptions: {}
    };
  },
  componentDidMount: function () {
    var self = this;
    $.ajax({
      url: self.props.url,
      dataType: 'json',
      cache: false
    })
      .success(function (data) {
        var lastUpdate = new Date(data.lastUpdate);
        var wheelOptionsObjs = data.wheels.reduce(function (wheelOptionsObjs, wheel) {
          $.each(wheel, function (prop, val) {
            if (!(prop in wheelOptionsObjs)) wheelOptionsObjs[prop] = {};
            wheelOptionsObjs[prop][val] = typeof val;
          });
          return wheelOptionsObjs;
        }, {});
        self.setState({
          wheels: data.wheels,
          lastUpdate: isNaN(lastUpdate) ? null : lastUpdate,
          wheelOptions: Object.keys(wheelOptionsObjs).reduce(function (wheelOptions, option) {
            var wheelOptionObj = wheelOptionsObjs[option];
            var wheelOption = Object.keys(wheelOptionObj);
            wheelOptions[option] = wheelOptionObj[wheelOption[0]] === 'number'
              ? wheelOption.sort(function (a, b) { return Number(a) - Number(b); })
              : wheelOption.sort();
            return wheelOptions;
          }, {})
        });
      })
      .error(function(xhr, status, err) { console.error(self.props.url, status, err.toString()); });
  },
  renderWheels: function () {
    var self = this;
    return self.state.wheels.reduce(function (wheels, wheel) {
      if (Object.keys(self.state.selectedWheelOptions).every(function (prop) {
        var selectedWheelOption = self.state.selectedWheelOptions[prop];
        return !selectedWheelOption || wheel[prop].toString() === selectedWheelOption;
      })) {
        wheels.push(Object.keys(wheel).reduce(function (renderedWheel, prop) {
          var val = wheel[prop];
          if (prop.match(/Inches$/)) renderedWheel[prop] = val + " in.";
          else if (prop.match(/Lbs$/)) renderedWheel[prop] = val + " lbs.";
          else renderedWheel[prop] = val;
          return renderedWheel;
        }, {}));
      }
      return wheels;
    }, []);
  },

  stopPropagation: function (evt) { evt.stopPropagation(); },
  selectChanged: function (evt) {
    var self = this;
    self.state.selectedWheelOptions[evt.target.name] = evt.target.value;
    self.setState({selectedWheelOptions: self.state.selectedWheelOptions});
  },
  render: function () {
    var Table = Reactable.Table;
    var Thead = Reactable.Thead;
    var Th = Reactable.Th;
    return (
      <div>
        <Table className="table table-condensed"
          data={this.renderWheels()}
          filterable={Object.keys(this.state.wheelOptions)}
          sortable={true} defaultSort={{column: 'weightLbs', direction: 'asc'}}
          itemsPerPage={100} pageButtonLimit={5}>
          <Thead>
            <Th column="name"><span className="name-header">Name</span></Th>
            <Th column="mfgMethod">
              <span className="mfgMethod-header">
                <select name="mfgMethod" onChange={this.selectChanged} onClick={this.stopPropagation}>
                  <option value="">Manufacturing Method</option>
                  {(this.state.wheelOptions.mfgMethod || []).map(function (mfgMethod) {
                    return <option value={mfgMethod} key={mfgMethod}>{mfgMethod}</option>;
                  })}
                </select>
              </span>
            </Th>
            <Th column="diameterInches">
              <span className="diameterInches-header">
                <select name="diameterInches" onChange={this.selectChanged} onClick={this.stopPropagation}>
                  <option value="">Diameter</option>
                  {(this.state.wheelOptions.diameterInches || []).map(function (diameterInches) {
                    return <option value={diameterInches} key={diameterInches}>{diameterInches} in.</option>;
                  })}
                </select>
              </span>
            </Th>
            <Th column="widthInches">
              <span className="widthInches-header">
                <select name="widthInches" onChange={this.selectChanged} onClick={this.stopPropagation}>
                  <option value="">Width</option>
                  {(this.state.wheelOptions.widthInches || []).map(function (widthInches) {
                    return <option value={widthInches} key={widthInches}>{widthInches} in.</option>;
                  })}
                </select>
              </span>
            </Th>
            <Th column="weightLbs">
              <span className="weightLbs-header">
                <select name="weightLbs" onChange={this.selectChanged} onClick={this.stopPropagation}>
                  <option value="">Weight</option>
                  {(this.state.wheelOptions.weightLbs || []).map(function (weightLbs) {
                    return <option value={weightLbs} key={weightLbs}>{weightLbs} lbs.</option>;
                  })}
                </select>
              </span>
            </Th>
          </Thead>
        </Table>
        {this.state.lastUpdate ? <small>Last updated: {this.state.lastUpdate.toString()}</small> : ''}
      </div>
    );
  }
});
var component = ReactDOM.render(<WheelDatabase url="wheels.json" />,
  document.getElementById('wheel-database')
);
