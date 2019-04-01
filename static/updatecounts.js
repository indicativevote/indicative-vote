function current_time() {
  return new Date().getTime() / 1000;
}


function get_latest_count(index) {
    //const url ="https://splasho.com/petitions/get_latest_count.php?petition="+ petition_ids[index];
    const url= "https://petition.parliament.uk/petitions/"+petition_ids[index]+"/count.json";
    console.log(url);
    fetch(url).then(data => data.json())
    .then(thedata => {
        console.log("Got new data ", thedata);
        if (thedata.signature_count) {
            if (thedata.signature_count != most_recent_counts[index]) {
              most_recent_times[index] = current_time();
              console.log("Updating time");
            }
            most_recent_counts[index] = thedata.signature_count;
        }
    })
    .catch(err => {
        console.log(err);
    })
}

function get_latest_rate(index) {
    const url ="https://splasho.com/petitions/get_rate.php?petition=" + petition_ids[index];
    console.log(url);
    fetch(url).then(data => data.json())
    .then(data => {rates[index] = data.signature_rate;})
    .catch(err => {
        console.log(err);
    })
}

function update_num_signatures(index) {
  const time_diff = current_time() - most_recent_times[index];
  const predicted_sig_diff = Math.round(rates[index] * time_diff);
  const new_sigs = most_recent_counts[index] + predicted_sig_diff;
  if (new_sigs) {
      const els=document.querySelectorAll('.signatures_'+ petition_ids[index]);
      Array.prototype.forEach.call(els, (el =>{
            el.innerHTML = Math.ceil(new_sigs)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      }));
  }
}

function update_all_counts() {
  for (var i in petition_ids) {
    get_latest_count(i);
  }
  setTimeout(update_all_counts, 60000);
}
function update_all_rates() {
  for (var i in petition_ids) {
    get_latest_rate(i);
  }
  setTimeout(update_all_rates, 60000 * 5);
}

function update_the_display() {
  for (var i in petition_ids) {
    update_num_signatures(i);
  }
  setTimeout(update_the_display, 1000);
}


let most_recent_counts=[];
let most_recent_times=[];
let rates =[];
// Check if the DOMContentLoaded has already been completed
if (document.readyState !== 'loading') {
  start_count();
} else {
  document.addEventListener('DOMContentLoaded', start_count);
}
function start_count() {
    most_recent_counts =Array(petition_ids.length).fill(0);
    most_recent_times = Array(petition_ids.length).fill(current_time());
    rates = Array(petition_ids.length).fill(0);
    update_all_counts();
    update_the_display();
    update_all_rates();
};
