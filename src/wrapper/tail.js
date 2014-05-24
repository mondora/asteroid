// @if ENV=='browser'
return Asteroid;

}));
// @endif

// @if ENV=='node'
module.exports = Asteroid;
// @endif
