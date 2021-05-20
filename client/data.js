let locations = new ReactiveVar([]);

$.get('/data.json', function (data) {
  if (typeof data === 'string') data = JSON.parse(data);

  locations.set(data.locations);
  console.log(locations.get());
});

export { locations };
