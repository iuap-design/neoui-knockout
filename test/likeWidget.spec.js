var expect = chai.expect();


describe('like-widget test', function () {
    function Product(name, rating) {
        this.name = name;
        this.userRating = ko.observable(rating || null);
    }

    function MyViewModel() {
        this.products = [
            new Product('Garlic bread'),
            new Product('Pain au chocolat'),
            new Product('Seagull spaghetti', 'like') // This one was already 'liked'
        ];
    }

    ko.applyBindings(new MyViewModel());
    describe('like-widget should be exsit', function () {

    });
});
