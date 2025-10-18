Component({
  properties: {
    innerText: {
      type: String,
      value: 'default value',
    },
  },
  lifetimes: {
    created: function () {
      console.log('avatar component created!')
    },
  },
})
