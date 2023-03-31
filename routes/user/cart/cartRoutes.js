const express=require('express')
const router=express.Router()
const fetchAdmin=require('../../../middleware/fetchAdmin')
const Cart=require('../../../models/Cart')
const Product=require('../../../models/Product')


router.post('/addItem',fetchAdmin,async(req,res)=>{
    try {
        //checking that cart is created or not
        const cart=await Cart.findOne({userId:req.user.id})
        
        if(cart){
            const product = await Product.findById(req.body.pid);
            // if cart exist then finding the product we going to insert
            const item=cart.products.findIndex((item)=>
            item.productId.toString()===req.body.pid)

            // creating function to get id
            // let item=-1;
            // for (let i = 0; i < cart.products.length; i++) {
            //    if(cart.products[i].productId.toString()===req.body.pid){
            //     item=i
            //     break
            //    }
            // }

            if(item!=-1){
                cart.products[item].quantity+=Number(req.body.quantity)
                cart.products[item].price+=Number(req.body.quantity )* product.price
            }
            else{
                cart.products.push({
                    productId: product._id,
                    name:product.name,
                    quantity: req.body.quantity,
                    price: req.body.quantity * product.price,
                  });
            }
            await cart.save()

            res.status(200).json({ cart });
        } 
        else{
            const product=await Product.findById(req.body.pid)
            const newCart=await Cart.create({
                userId:req.user.id,
                products:[{productId:product._id,name:product.name,quantity:req.body.quantity,price:req.body.quantity*product.price}]
            })
            res.status(200).send({newCart})
        }

    } catch (error) {
        res.status(500).json(`Some internal error occured ${error}`)
    }
})

// delete item from cart
router.post('/deleteItem',fetchAdmin,async(req,res)=>{
    try {
        //checking that cart is created or not
        const cart=await Cart.findOne({userId:req.user.id})
        
        if(!cart){
            res.status(400).json("Cart doesn't exist");
        }

        // if cart exist then finding the product we going to insert
        const product = await Product.findById(req.body.pid);

        const item=cart.products.findIndex((item)=>
        item.productId.toString()===req.body.pid)
        if(item!=-1){
            cart.products.splice(item,1)
        }
        await cart.save()

        res.status(200).json({ cart });

    } catch (error) {
        res.status(500).json(`Some internal error occured ${error}`)
    }
})

module.exports=router