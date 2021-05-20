import './form.html';

import { locations } from './data';
import Pikaday from 'pikaday';

Template.Form.onCreated(() => {});

Template.Form.onRendered(() => {
  this.$('select').select2({
    minimumResultsForSearch: 10,
    placeholder: 'Select something...',
  });

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

  hoursFrom: () => {
    return ['08:00', '08:30', '09:00'];
  },

  hoursTo: () => {
    return ['08:30', '09:00', '09:30'];
  },
});

Template.Form.events({
  'change #location': (e) => {
    console.log(e.target.value);
  },
});
