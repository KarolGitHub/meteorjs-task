import './form.html';

import { locations } from './data';
import Pikaday from 'pikaday';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

Template.Form.onCreated(function FormOnCreated() {
  this.hoursFrom = new ReactiveVar(['08:00', '08:30', '09:00']);
  this.hoursTo = new ReactiveVar(['08:00', '08:30', '09:00']);

  const timeRangeToInt = (time) =>
    ((hours, minutes) => hours * 2 + minutes / 30)(
      ...time.split(':').map(parseFloat)
    );
  const toTime = (int) =>
    [Math.floor(int / 2), int % 2 ? '30' : '00'].join(':');
  const getSelectionFromRange = (from, to) =>
    Array(to - from + 1)
      .fill()
      .map((_, i) => from + i);

  this.generateTimeSelection = (from, to) => {
    return getSelectionFromRange(...[from, to].map(timeRangeToInt)).map(toTime);
  };
});

Template.Form.onRendered(function FormOnRendered() {
  this.$('select').select2({
    minimumResultsForSearch: 10,
    placeholder: 'Select something...',
  });

  locationsIDs = [];
  for (let i = 0; i < locations.curValue.length; i++) {
    locationsIDs[`${locations.curValue[i].id}`] = i;
  }

  // max_advance_time = time in hours how far in the future to allow selection
  // max_duration = time in minutes how long one selection can take
  new Pikaday({
    field: $('#datepicker').get(0),
    format: 'YYYY-MM-DD',
    onSelect: function () {
      console.log(this.getMoment());
    },
  });
});

Template.Form.helpers({
  locations: () => locations.get(),
  hoursFrom: () => Template.instance().hoursFrom.get(),
  hoursTo: () => Template.instance().hoursTo.get(),
});

Template.Form.events({
  'change #location': (e, instance) => {
    const getLocationID = locationsIDs[`${e.target.value}`];
    const {
      time_from: from,
      time_to: to,
      max_advance_time: advance,
      max_duration: duration,
    } = locations.curValue[getLocationID];
    const timeRange = Template.instance().generateTimeSelection(from, to);
    instance.hoursFrom.set(timeRange);
    instance.hoursTo.set(timeRange);
  },
});
