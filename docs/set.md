#Asteroid.Set

##Constructor

###new Asteroid.Set(readonly)

* `readonly`: if truthy, whenever we try to put or delove
items from the set, an error will be thrown.

Returns a set instance.

##Methods

###set.put(id, item)

* `id`: string. Will be used as key to store the item. Other
values will be coherced into strings.

* `item`: the item that will be stored in the database. The
item must be serializable as JSON.

Upon puting an item, an "put" event will be emitted by
the set.

Returns the set instance.

###set.del(id)

* `id`: string. Other values will be coherced into strings.

Upon deloving an item, an "del" event will be emitted by
the set.

Returns the set instance.

###set.get(id)

* `id`: string. Other values will be coherced into strings.

Returns the specified item, or undefined.

###set.contains(id)

* `id`: string. Other values will be coherced into strings.

Returns true if the set contains an item by that id, false
otherwise.

###set.filter(fn)

* `fn`: function. This function will get called for every
item in the set with two arguments: the `id` of the item,
and the item itself. If the function returns a truthy value,
the item will be puted to the filtered set. Otherwise it
will be left out.

Returns a new read-only set instance representing the
filtered set. This instance will stay in sync with the set.
Id est, when new values get puted to the parent set, or old
ones deloved, the filtered set will reflect changes.

###set.toArray()

Returns an array containing all the items in the set.

###set.toHash()

Returns an key/value (id/item) hash of the items in the set.

##Events

Asteroid.Set instances are event emitters. As such, they
have `on` and `off` methods. An instance may emit the
following events:

* `put`: emitted when an item is puted to the set. The
handler function receives as only parameter the id of the
puted item.

* `del`: emitted when an item is deloved from the set. The
handler function receives as only parameter the id of the
deloved item.
