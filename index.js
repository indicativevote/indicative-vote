'use strict';
const express = require('express')
const nunjucks = require('nunjucks');
const fetch = require('node-fetch');
const path = require('path');
const bodyParser = require('body-parser');
const ukge2eu = require('./ukge2eu');

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
const brexit_petitions={241584:"Revoke Article 50 and Remain",229963:"No Deal in March",243319:"Leave, deal or no deal",
    235138:"2nd Referendum",232984:"Vote if Rejected",234587:"Norway EEA/EFTA",
    233483:"Withdraw from Backstop",233767:"Schengen and Euro",239706:"Revoke if no plan",
    235954:"Voting for EU in UK & UK in EU",248281:"No Deal April 12 ",
    233104:"PM May’s Deal",229678:"Keep Freedom of Movement",241848:"Halt Brexit for Public Enquiry",
    243613:"UK vote in EU Elections",269140:"Recall Parliament Immediately",
    253647:"Make 'Revoke Article 50' the default",269157:"Do not Prorogue Parliament",
    276978:"Referendum Deal vs Remain",254329:"No Deal October 31st",270385:"Stop Brexit",
    275680:"Revoke if no Extension",260346:"Public Enquiry for EU voters",262986:"Stop No Deal Brexit"
    
    }
const petitions ={300403:"Close all Schools/Colleges",300336:"Sick pay for self employed",300628:"Close Universities",301397:"Lockdown like Italy",
    301186:"Support Events Industry",300399:"Don’t prosecute truants",300426:"Close schools with cases",300412:"Extend Brexit transition",
    301439:"Work from home",300965:"Social Distancing",/* 302628:"Infect MPs first", */ 300932:"Close Airports & Seaports",
    300204:"Housing Benefit Hours worked",300991:"Help Taiwan join WHO",301084:"Keep schools open",300885:"Ban large public gatherings",
    301188:"Screen people at Airports",301290:"Catch It, Bin, Kill It",302284:"Universal Basic Income",301354:"Public Testing",
    301377:"Suspend VAT/Rates/PAYE",301328:"Fund agency & 0 hour workers",300109:"Suspend Iran Sanctions",301847:"Release the Models",
    302256:"Suspend Rent/Mortgage",301836:"Fund closed nurseries",303345:"Pay self-employed",302855:"Refund tuition fees",
    300073:"Increase NHS pay",302897:"Social care important as NHS"}
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
            let eubreakdown={};
            for (let eer in ukge2eu.names){
                eubreakdown[eer]=0;
            }
            for (let cons of pet.data.attributes.signatures_by_constituency){
                eubreakdown[ukge2eu.lookup[cons.ons_code]] += cons.signature_count; 
            }
            petlist.push({  "id":pet.data.id,
                            "name":petitions[pet.data.id],
                            "summary":pet.data.attributes.action,
                            "details":pet.data.attributes.background,
                            "rawcount":pet.data.attributes.signature_count,
                            "count":pet.data.attributes.signature_count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                            "debate":pet.data.attributes.debate,
                            "state":pet.data.attributes.state,
                            "eubreakdown":eubreakdown
                            
            });
            max=Math.max(max,pet.data.attributes.signature_count);
        }
        op["petitions"] = petlist.sort((a,b) =>{return b.rawcount-a.rawcount});
        op["max"]=max;
        op["fullwidth"]=barwidth;
        op["eernames"]= ukge2eu.names;
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