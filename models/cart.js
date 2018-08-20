module.exports = function cart(oldcart){
    this.items = oldcart.items || {};
    this.totalqty = oldcart.totalqty || 0;
    this.totalprice = oldcart.totalprice || 0;

    this.add = function(item, id){
        var stored = this.items[id];
        if(!stored){
            stored = this.items[id] = {item: item, qty: 0, price: 0};
            }
         stored.qty++;
        stored.price = stored.item.price * stored.qty;
        this.totalqty++;
        this.totalprice += stored.item.price;
    }

    this.generateArray = function () {
        var arr = [];
        for(var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };
};