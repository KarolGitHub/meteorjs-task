import './form.html';

import { locations } from './data';
import Pikaday from 'pikaday';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

Template.Form.onCreated(function FormOnCreated() {
  this.hoursFrom = new ReactiveVar(['08:00', '08:30', '09:00']);
  this.hoursTo = new ReactiveVar(['08:00', '08:30', '09:00']);
  this.currentLocation = new ReactiveVar(null);

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
      time_from: timeFrom,
      time_to: timeTo,
      max_advance_time: maxAdvanceTime,
      max_duration: maxDuration,
    } = locations.get()[getLocationID];

    instance.currentLocation.set({
      timeFrom,
      timeTo,
      maxAdvanceTime,
      maxDuration,
    });
    const timeRange = Template.instance().generateTimeSelection(
      timeFrom,
      timeTo
    );
    instance.hoursFrom.set(timeRange);
    instance.hoursTo.set(timeRange);
  },
  'change #time-from': function (e, instance) {
    let maxDuration = instance.currentLocation.get()?.maxDuration;
    if (maxDuration) {
      const timeFromSelect = e.target;
      const timeFrom = timeFromSelect.value;

      let selectedIndex = timeFromSelect.selectedIndex;
      maxDuration = Math.floor(maxDuration / 30);
      const maxValue = selectedIndex + maxDuration;

      const timeTo =
        maxValue > timeFromSelect.length - 1
          ? $($('#time-from').children()[timeFromSelect.length - 1]).val()
          : $($('#time-from').children()[maxValue]).val();

      const timeRange = Template.instance().generateTimeSelection(
        timeFrom,
        timeTo
      );
      instance.hoursTo.set(timeRange);
    }
  },
});
