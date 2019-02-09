console.log("hello world");
document.querySelector("#product-search").addEventListener("click", function(e){
    e.preventDefault();
    api.getProductViaUrl(document.querySelector("#product-url").value, function(err, productInfo){
        if (err) console.debug(err);
        else{
            console.log(productInfo);
        }
    })
});