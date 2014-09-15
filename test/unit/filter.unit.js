if (ENV === "node") {

	describe("The getFilterFromSelector function should return a function which filters objetcs", function () {
		var getFilterFromSelector = Asteroid.utils.getFilterFromSelector;
		var item0 = {
			_id: "postOne",
			title: "TitleOne",
			subtitle: "SubtitleOne",
			author: {
				name: {
					first: "Paolo",
					last: "Scanferla"
				},
				screenName: "pscanf"
			},
			permissions: {
				published: true
			}
		};
		var item1 = {
			_id: "postTwo",
			title: "TitleTwo",
			subtitle: "SubtitleTwo",
			author: {
				name: {
					first: "Paolino",
					last: "Paperino"
				},
				screenName: "pp313"
			},
			permissions: {
				published: false
			}
		};
		var item2 = {
			_id: "postThree",
			title: "TitleThree",
			subtitle: "SubtitleThree",
			author: {
				name: {
					first: "Paperon",
					last: "de' Papaeroni"
				},
				screenName: "$pdp"
			},
			permissions: {
				published: true
			}
		};

		it("with a basic selector", function () {
			var basicSelector = {
				_id: "postOne"
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(false);
		});

		it("with a deep selector", function () {
			var basicSelector = {
				"permissions.published": true
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(true);
		});

		it("with an $and selector", function () {
			var basicSelector = {
				$and: [
					{
						_id: "postThree"
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(false);
			filter(item1).should.equal(false);
			filter(item2).should.equal(true);
		});

		it("with an $or selector", function () {
			var basicSelector = {
				$or: [
					{
						_id: "postThree"
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(true);
		});

		it("with a $nor selector", function () {
			var basicSelector = {
				$nor: [
					{
						_id: "postThree"
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(false);
			filter(item1).should.equal(true);
			filter(item2).should.equal(false);
		});

		it("with nested $and selectors", function () {
			var basicSelector = {
				$and: [
					{
						$and: [
							{
								title: "TitleOne"
							},
							{
								subtitle: "SubtitleOne"
							}
						]
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(false);
		});

		it("with nested $and and $or selectors", function () {
			var basicSelector = {
				$and: [
					{
						$or: [
							{
								title: "TitleOne"
							},
							{
								subtitle: "SubtitleThree"
							}
						]
					},
					{
						"permissions.published": true
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(false);
			filter(item2).should.equal(true);
		});

		it("with supernested $or selectors", function () {
			var basicSelector = {
				$or: [
					{
						$or: [
							{
								$or: [
									{
										title: "TitleOne"
									},
									{
										subtitle: "SubtitleTwo"
									}
								]
							},
							{
								subtitle: "SubtitleThree"
							}
						]
					},
					{
						"permissions.published": "hello"
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(true);
			filter(item1).should.equal(true);
			filter(item2).should.equal(true);
		});

		it("with supernested $or and $and selectors", function () {
			var basicSelector = {
				$or: [
					{
						$or: [
							{
								$and: [
									{
										title: "TitleOne"
									},
									{
										subtitle: "SubtitleTwo"
									}
								]
							},
							{
								subtitle: "SubtitleThree"
							}
						]
					},
					{
						"permissions.published": false
					}
				]
			};
			var filter = getFilterFromSelector(basicSelector);
			filter(item0).should.equal(false);
			filter(item1).should.equal(true);
			filter(item2).should.equal(true);
		});

	});

}
