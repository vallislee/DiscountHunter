---
layout: default
permalink: /DiscountHunter/doc
---

# DiscountHunter API Documentation


## Account Management

### Local user
- description: create localuser
- request: `POST /api/local/signup/`
    - content-type: `application/json`
    - body: object
      - username: (string) name of the user
      - email: (string) user's email address
      - password: (string) password for sign in
      - captcah: (string) temporary captcha
- response: 200
    - content-type: `application/json`
    - body: object
      - username: (string) name of the user
      - hash: (string) salt hash for password
      - salt: (string) salt hash for password
      - email: (string) user's email address
      - type: (string) 'local' for local user
- response: 400
    - body: username/password/email is missing
    - body: Failed to verify
- response: 409
    - body: email already exists
```
$ curl -X POST
       -d "username=admin&password=pass4admin&email=admin@test.com&captcah=captcah"
       http://localhost:3000/api/local/signup/
```

- description: sign in for local user
- request: `POST /api/local/signin/`
    - content-type: `application/json`
    - body: object
      - email: (string) user's email address
      - password: (string) password for sign in
      - captcah: (string) temporary captcha
- response: 200
    - content-type: `application/json`
    - body: object
      - username: (string) name of the user
      - hash: (string) salt hash for password
      - salt: (string) salt hash for password
      - email: (string) user's email address
      - type: (string) 'local' for local user
- response: 400
    - body: username/password is missing
    - body: Failed to verify
- response: 401
    - body: access denied
```
$ curl -X POST
       -d "email=admin@test.com&password=pass4admin&captcah=captcah"
       -c cookie.txt
       http://localhost:3000/api/local/signin/
```

### google user
- description: google sign in
- request: `POST /oauth/google/sigin/`
    - content-type: `application/json`
    - body: object
      - token: (string) token provide from google
- response: 200
    - content-type: `application/json`
    - body: object
      - username: (string) name of the user
      - email: (string) user's email address
      - type: (string) 'google' for google sign in
- response: 404
    - body: Client does not exist
```
$ curl -X POST
       -d "token=token"
       http://localhost:3000/oauth/google/sigin/
```

### sign out
- description: sign out for local user and google user
- request: `GET /api/users/signout`
    - content-type: `application/json`
- response: 200
    - content-type: `application/json`
```
$ curl -X GET
       http://localhost:3000/api/users/signout
```  


## Product Management

### Add products
- description: start tracking product
- request: `POST /api/products/?url="url"`
    - content-type: `application/json`
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) the product id
      - name: (string) product name
      - retailer: (string) retailer of the product
      - url: (string) product's url
      - listedPrice: (string) product's current price
      - PriceChange: (int) default is 0
      - img: (string) product's image url
      - date: (DATE) start tracking date
- response: 404
    - body: Invalid URL was provided
    - body: url does not exist
```
$ curl -X POST
       -c cookie.txt
       http://localhsot:3000/api/products/?url="url"
```

### Product details
- description: retrieve product information
- request: `GET /api/details/?url="url"`
    - content-type: `application/json` 
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: (string) product id
      - name: (string) product name
      - image: (string) product image url
      - listedPrice: (string) product current price
- response: 404
    - body: url does not exist
```
$ curl -X GET
       -c cookie.txt
       http://localhost:3000/api/details/?url="url"
```

### Product Price
- description: retrieve lowest/median/highest of the tracked products
- request: `GET /api/price/?url="url"`
    - content-type: `application/json` 
- response: 200
    - content-type: `application/json`
    - body: object
      - minmum: (float) minimum product price
      - median: (float) median product price
      - maximum: (float) maximum product price
- response: 500
    - body: No price history
```
$ curl -X GET
       -c cookie.txt
       http://localhost:3000/api/price/?url="url"
```

### Price history
- description: retrieve product's history price
- request: `GET /api/pricehistory/?url="url"`
    - content-type: `application/json` 
- response: 200
    - content-type: `application/json`
    - body: list of object
      - listedPrice: (float) product price by date
      - date: (Date) the date of the price
- response: 500
    - body: No price history
```
$ curl -X GET
       -c cookie.txt
       http://localhost:3000/api/pricehistory/?url="url"
```

### Track product

#### Non signed in user
- description: add email notification for an item for non signed in user
- request: `POST /api/nonsigned/tracking/`
    - content-type: `application/json` 
    - body: object
      - email: (string) client's email address
      - desire_price: (float) client's desire price of the product
      - url: (string) product's url
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: id for item
      - email: (string) non signed user's email address
      - desire_price: (float) user's desire price
      - url: (string) product's url
- response: 400
    - body: email/desire_price/url is missing
```
$ curl -X POST
       -d "email=admin@test.com&desire_price=19.99&url=url"
       -c cookie.txt
       http://localhost:3000/api/nonsigned/tracking"
```

#### Signed in user
- description: add email notification for an item for signed in user
- request: `POST /api/signed/tracking/`
    - content-type: `application/json` 
    - body: object
      - desire_price: (float) client's desire price of the product
      - url: (string) product's url
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: id for item
      - email: (string) non signed user's email address
      - desire_price: (float) user's desire price
      - url: (string) product's url
- response: 400
    - body: desire_price/url is missing
```
$ curl -X POST
       -d "desire_price=19.99&url=url"
       -c cookie.txt
       http://localhost:3000/api/signed/tracking"
```

#### Delete tracking
- description: delete tracked item
- request: `DELETE /api/signed/tracking/:uid`
    - content-type: `application/json` 
    - body:
      - _id: (string) id of tracked item
- response: 200
    - content-type: `application/json`
    - body: object
      - _id: id for item
      - email: (string) non signed user's email address
      - desire_price: (float) user's desire price
      - url: (string) product's url
- response: 404
    - body: No id was provided
    - body: id does not exist
- response: 401
    - body: Access denied
```
$ curl -X DELETE
       -c cookie.txt
       http://localhost:3000/api/signed/tracking/:uid"
```


### Users' product
- description: retrieve items that were tracked by current user
- request: `GET /api/user/tracked/`
    - content-type: `application/json` 
- response: 200
    - content-type: `application/json`
    - body: object
      - user_name: (string) current user's name
      - user_email: (string) current user's email
      - object: (list) list of product
- response: 500
    - body: No price history
```
$ curl -X GET
       -c cookie.txt
       http://localhost:3000/api/user/tracked/
```

### number of Users' tracked products
- description: retrieve the total number of added items for current user
- request: `GET /api/user/tracked/num/`
    - content-type: `application/json` 
- response: 200
    - content-type: `application/json`
    - body: INT
      - num: (int) number of tracked item
```
$ curl -X GET
       -c cookie.txt
       http://localhost:3000/api/user/tracked/num/
```

## deals
### products that are on sale
- description: retrieve a list of products that price are dropped
- request: `GET /api/products/deals`
    - content-type: `application/json` 
- response: 200
    - content-type: `application/json`
    - body: list of object
      - _id: (string) the product id
      - name: (string) product name
      - retailer: (string) retailer of the product
      - url: (string) product's url
      - listedPrice: (string) product's current price
      - PriceChange: (int) default is 0
      - img: (string) product's image url
      - date: (DATE) tracking date
```
$ curl -X GET
       -c cookie.txt
       http://localhost:3000/api/products/deals
```

### number of product is on sale
- description: get the total number of the products that price are dropped
- request: `GET /api/products/deals/num/`
    - content-type: `application/json` 
- response: 200
    - content-type: `application/json`
    - body: INT
      - num: (int) total number of the products that price are dropped
```
$ curl -X GET
       -c cookie.txt
       http://localhost:3000/api/products/deals/num/
```

## Feedback
- description: send feedback
- request: `POST /api/user/feedback/`
      - content-type: `application/json`
      - body: object
        - name: (string) username
        - email: (string) user's email address
        - message: (string) user's feedback
- response : 200
      - content-type: `application/json`
      - body: Thankyou for your feedback
- response : 404
      - body: enter a valid email addres
```
$ curl -X POST
       -d "name=admin&email=admin@test.com&message=message"
       -c cookie.txt
       http://localhost:3000/api/products/deals/num/
```