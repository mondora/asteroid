#Asteroid.Set

##Constructor

###new Asteroid.Set(readonly)

* `readonly`: if truthy, whenever we try to add or remove
items from the set, an error will be thrown.

Returns a set instance.

##Methods

###set.add(id, item)

* `id`: string. Will be used as key to store the item. Other
values will be coherced into strings.

* `item`: the item that will be stored in the database. The
item must be serializable as JSON.

Upon adding an item, an "add" event will be emitted by
the set.

Returns the set instance.

###set.rem(id)

* `id`: string. Other values will be coherced into strings.

Upon removing an item, an "rem" event will be emitted by
the set.

Returns the set instance.

###set.get(id)

* `id`: string. Other values will be coherced into strings.

Returns the specified item, or undefined.

###set.filter(fn)

* `fn`: function. This function will get called for every
item in the set with two arguments: the `id` of the item,
and the item itself. If the function returns a truthy value,
the item will be added to the filtered set. Otherwise it
will be left out.

Returns a new read-only set instance representing the
filtered set. This instance will stay in sync with the set.
Id est, when new values get added to the parent set, or old
ones removed, the filtered set will reflect changes.

###set.toArray()

Returns an array containing all the items in the set.

###set.toHash()

Returns an key/value (id/item) hash of the items in the set.

##Events

Asteroid.Set instances are event emitters. As such, they
have `on` and `off` methods. An instance may emit the
following events:

* `add`: emitted when an item is added to the set. The
handler function receives as only parameter the id of the
added item.

* `rem`: emitted when an item is removed from the set. The
handler function receives as only parameter the id of the
removed item.
