'use strict';
const express = require('express')
const nunjucks = require('nunjucks');
const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');

const app = express()
const port = process.env.PORT || 30000
const barwidth=200;

app.use(bodyParser.json()); // for parsing application/json 
app.use(express.static(__dirname + '/static'));

app.set('views', 'views');
nunjucks.configure(path.resolve(__dirname, 'views'), {
    autoescape: true,
    express: app
});
const petitions={241584:"Revoke Article 50 and Remain",229963:"No Deal in March",243319:"Leave, deal or no deal",
    235138:"2nd Referendum",232984:"Vote if Rejected",234587:"Norway EEA/EFTA",
    233483:"Withdraw from Backstop",233767:"Schengen and Euro",239706:"Revoke if no plan",
    235954:"Voting for EU in UK & UK in EU",248281:"No Deal April 12 ",
    233104:"PM May’s Deal",229678:"Keep Freedom of Movement",241848:"Halt Brexit for Public Enquiry",
    //254716:"UK vote in EU Elections" https://petition.parliament.uk/petitions/254716/sponsors/new?token=q0Y4VfI8JZgeGtjThn
    }
function get_petitions(id_list){
    let op={"err":""};
    let max=0;
    //console.log(id_list);
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
                            "debate":pet.data.attributes.debate,
                            "state":pet.data.attributes.state
                            
            });
            max=Math.max(max,pet.data.attributes.signature_count);
        }
        op["petitions"] = petlist.sort((a,b) =>{return b.rawcount-a.rawcount});
        op["max"]=max;
        op["fullwidth"]=barwidth;
        for (let i=0;i<petlist.length;i++){
            petlist[i]["width"] = Math.max(0.2,barwidth*petlist[i]["rawcount"]/max);
        }
        
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