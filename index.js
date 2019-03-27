'use strict';
const express = require('express')
const nunjucks = require('nunjucks');
const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');

const app = express()
const port = process.env.PORT || 30000

app.use(bodyParser.json()); // for parsing application/json
app.set('views', 'views');
nunjucks.configure(path.resolve(__dirname, 'views'), {
    autoescape: true,
    express: app
});
const petitions={241584:"Revoke A50",229963:"No Deal",243319:"Leave or No deal",235138:"2nd Referendum",232984:"Vote if Rejected"}
const content={"petitions":[
    {"name":"Revoke Article 50 and remain in the EU.","summary":"The government repeatedly claims exiting the EU is 'the will of the people'. We need to put a stop to this claim by proving the strength of public support now, for remaining in the EU. A People's Vote may not happen - so vote now.",
     "count":5758090,"id":241584},
    {"name":"Leave the EU without a deal in March 2019.","summary":"We are wasting Billions of pounds of taxpayers money trying to negotiate in a short space of time. Leaving the EU in March 2019 will allow the UK good time to negotiate more efficiently. The EU will be more eager to accept a deal on our terms having lost a major partner.",
     "count":571441,"id":229963},
]};
function get_petitions(id_list){
    let op={"err":""};
    let max=0;
    console.log(id_list);
    const fetches = Object.keys(id_list).map(id => fetch("https://petition.parliament.uk/petitions/"+id+".json").then(v =>v.json()));
    //console.log(fetches);
    return Promise.all(fetches).then (pets =>{
        //console.log(pets);
        let petlist=[];
        for (let pet of pets){
            petlist.push({  "id":pet.data.id,
                            "name":petitions[pet.data.id],
                            "summary":pet.data.attributes.action,
                            "details":pet.data.attributes.background,
                            "rawcount":pet.data.attributes.signature_count,
                            "count":pet.data.attributes.signature_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            
            });
            max=Math.max(max,pet.data.attributes.signature_count);
        }
        op["petitions"] = petlist.sort((a,b) =>{return b.rawcount-a.rawcount});
        op["max"]=max;
        //console.log(op);
        return op;
    })
    .catch(err => {
        console.log(err);
        op["err"]=err;
        return op;
    })
}
app.get('/',function(req,res){
    get_petitions(petitions).then(op=>{
        res.render('index.njk',op);
        //console.log("op:"+op);
    })
})

app.listen(port, () => console.log(`Indicative listening on port ${port}!`))