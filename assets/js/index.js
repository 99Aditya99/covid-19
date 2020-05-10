window.onload = function() {
    $(".navbar-nav>li>a").on("click", function(){
        $("#navbarDiv").collapse("hide");
    });
    getDtaFromServer()
  };

async function getDtaFromServer() {
    try {
      let sarverData = await Promise.all([
        fetch('https://api.rootnet.in/covid19-in/stats/latest').then((response) => response.json()),// parse each response as json
        fetch('https://api.rootnet.in/covid19-in/stats/testing/latest').then((response) => response.json())
        ]);
        let mykeys=["coronaTotalInfo","coronaTesting"]
        await sarverData.map((data,index)=>{
            console.log("data loaded")
            addDataToSession(mykeys[index],JSON.stringify(data))
        })
        await getNewsFromServerAndStoreIntoSeeeion()
        await getEssentialServicesAndStoreIntoSession()
        await main()

    } catch (error) {
      console.log(error);
    }
  }

function getNewsFromServerAndStoreIntoSeeeion(){
    key="6368149cef8a4894adda80122a9a5d8d"
    url=`http://newsapi.org/v2/top-headlines?sources=google-news-in&apiKey=${key}`
    fetch(url)
    .then((response)=>{
            return response.json()
        })
    .then((data)=>{
        addDataToSession("coronaNews",JSON.stringify(data.articles))
        console.log("News data loaded")
    })

}

function getEssentialServicesAndStoreIntoSession(){
    // key="6368149cef8a4894adda80122a9a5d8d"
    url=`https://api.covid19india.org/resources/resources.json`
    fetch(url)
    .then((response)=>{
            return response.json()
        })
    .then((data)=>{
        // let updatedData = data.resources.filter(mydata => mydata.state=mydata.state.toLowerCase().replace(/\s/g, ""))
        addDataToSession("essentialServices",JSON.stringify(data.resources))
        // console.log(data.resources)
        console.log("essencial services data loaded")
    })

}


function addDataToSession(key,value){
      sessionStorage.setItem(key,value)
}



function main(){
    // getting data from session to local variable 
    let coronaTotalInfo = JSON.parse(sessionStorage.getItem("coronaTotalInfo")).data
    let coronaTesting = JSON.parse(sessionStorage.getItem("coronaTesting")).data
    

    
    // getting individial data
    let active_cases = coronaTotalInfo["unofficial-summary"][0].active
    let cured= coronaTotalInfo["unofficial-summary"][0].recovered
    let deaths=  coronaTotalInfo["unofficial-summary"][0].deaths
    let total_testing_today = coronaTesting.totalSamplesTested
    let state_with_all_data= stateData(coronaTotalInfo["regional"])

    
    // invoking the classes 
    let allIndiaCoronaInfo = new AllIndiaCoronaInfo(active_cases,cured,deaths,total_testing_today)
    allIndiaCoronaInfo.displayDataToCard()

    let allStateCoronaInfo = new AllStateCoronaInfo(state_with_all_data)
    allStateCoronaInfo.displayStateIntoModalOnClick()
    // allStateCoronaInfo.displayDetailsOnClickOfState()
    let coronVirusNews=new CoronVirusNews()
    coronVirusNews.displayNewsIntoWeb()

    let essentialServices = new EssentialServices()
    essentialServices.displayEssentialServicesOnWeb()
    essentialServices.searchServicesByState()

}


// creating a local array to store individual state corona data as obj and 
// returning to main function
const stateData=(data)=>{
    let state_with_all_data_obj=[]
    data.map((mydata)=>{
        state_with_all_data_obj.push(mydata)
    })
    return state_with_all_data_obj
}


class AllIndiaCoronaInfo{
    constructor(active_cases,cured,deaths,total_testing_today){
        this.active_cases=active_cases
        this.cured=cured
        this.deaths=deaths
        this.total_testing_today=total_testing_today
    }
    displayDataToCard(){
        let total_active_cases=document.getElementById("total_active_cases")
        let total_cured=document.getElementById("total_cured")
        let total_deaths=document.getElementById("total_deaths")
        let total_test=document.getElementById("total_test")
        total_active_cases.innerText=this.active_cases
        total_cured.innerText=this.cured
        total_deaths.innerText=this.deaths
        total_test.innerText=this.total_testing_today
    }
}

class AllStateCoronaInfo{
    constructor(state_with_all_data){
        this.state_with_all_data=state_with_all_data
    }
    displayStateIntoModalOnClick=()=>{
        let selectStateBtn = document.getElementById("selectStateBtn")
        selectStateBtn.addEventListener("click", this.handleClickOnStateBtn)
        // console.log("object")
        
    }
    handleClickOnStateBtn=()=>{
        let displayListOfStateInModal=document.getElementById("displayListOfStateInModal")
        let html=""
        this.state_with_all_data.map((state,index)=>{
            html +=`
                <div class="list-group mb-1">
                <a id="${index}" onclick="AllStateCoronaInfo.displayStateOnScreen(this.id)" style="text-decoration: none;" class="list-group-item active">${state.loc}</a>
                </div>  
            `
        })
        displayListOfStateInModal.innerHTML=html

    }
    static displayStateOnScreen=(stateId)=>{
        let coronaTotalInfo= JSON.parse(sessionStorage.getItem('coronaTotalInfo')).data.regional
        let soloStateData=coronaTotalInfo[stateId]
        // console.log(coronaTotalInfo[stateId])
        
        let displayStateDataCard_Animation=document.getElementById("displayStateDataCard_Animation")
        let html=`
        <div  class="row">
            <div  class="col-lg-6 col-md-6 col-xs-12">
                <div class="card" style="width:100%; height:300px" >
                <div class="card-body bg-light">
                    <h4 class="card-title  p-2">Name of State : ${soloStateData.loc} </h4>
                    <h6 class="text-muted card-subtitle p-2">Total Confirmed cases : ${soloStateData.totalConfirmed}</h6>
                    <h6 class="text-muted card-subtitle p-2">Cured/Discharged : ${soloStateData.discharged}</h6>
                    <h6 class="text-muted card-subtitle p-2"><strong>Total Deaths : ${soloStateData.deaths}</strong></h6>
                </div>
                </div>
            </div>
            <div class="col-lg-6 col-md-6 col-xs-12">
                <div style="width:100%; height:300px">
                    <lottie-player src="https://assets1.lottiefiles.com/packages/lf20_CYBIbn.json" mode="bounce" background="transparent"  speed="0.6"  loop  autoplay></lottie-player>
                </div>
            </div>
        </div>
            `
        // hide the modal after selecting the state 
        $('#StateDataModal').modal('hide');
        
        displayStateDataCard_Animation.innerHTML = html
    }

}


class CoronVirusNews{
    filterCoronaVirusnews(){
        let coronaVirusNewsObject=[]
        // getting coronews from session
        let allSessionNews= JSON.parse(sessionStorage.getItem('coronaNews'))
        allSessionNews.map((news)=>{
            let searchStr1 = news.content.match(/corona/i)
            let searchStr2 = news.description.match(/corona/i)
            let searchStr3 = news.title.match(/coronavirus/i)
            if (searchStr1||searchStr2||searchStr3){
                coronaVirusNewsObject.push(news)
            }
        })
        return coronaVirusNewsObject
        // return allSessionNews
    }

    displayNewsIntoWeb=()=>{
        let filterCoronaVirusnews=this.filterCoronaVirusnews()
        let newsCarousalBlock=document.getElementById("newsCarousalBlock")
        let html=""

        filterCoronaVirusnews.map((news,index)=>{

            html += `
            <div id="newsActive${index}" class="carousel-item  ">
            <div class="card text-center">
                <img id="newsImage" class="card-img-top" src="${news.urlToImage}" alt="Card image cap">
                <div class="card-body">
                    <h2 class="card-title font-weight-bold text-success ">${news.title}</h2>
                    <blockquote class="blockquote">
                        <p class="mb-0">${news.description}</p>
                        <footer class="blockquote-footer">${news.author}
                            <cite title="Source Title">${news.publishedAt}</cite>
                        </footer>
                    </blockquote>
                </div>
            </div>
            </div>
            `     
            // html +=`${news.title}`
        })
        
        newsCarousalBlock.innerHTML =html
        let newsActive0=document.getElementById("newsActive0")
        newsActive0.classList.add("active")
        
    }
}

class EssentialServices{
    displayEssentialServicesOnWeb(){
        let displayNotesDiv=document.getElementById("displayNotesDiv")
        let essentialServices=JSON.parse(sessionStorage.getItem("essentialServices"))
        let totalNoOfElements = 3
        let html=""
        essentialServices.slice(0,totalNoOfElements).forEach((service,index)=>{
            
            html +=`
                        <div class=" note_card col-lg-4 col-md-4 mb-2">
                        <div class="card-group">
                            <div class="card bg-warning text-white scroll p-3">
                                <div class="card-body">
                                    <h4  class="card-title"><span class="text-dark">Category:</span> <span class="text-uppercase text-danger"> ${service.category}</span></h4>
                                    <p id="cardtitle"><span class="text-dark">State : </span> ${service.state}</p>
                                    <p><span class="text-dark">City :</span> ${service.city}</p>
                                    <p><span class="text-dark">Organization : </span> : ${service.nameoftheorganisation}</p>
                                    <p><span class="text-dark">Description :</span> ${service.descriptionandorserviceprovided}</p>
                                    <p><span class="text-dark">Phone :</span> ${service.phonenumber}</p>
                                    <p><span class="text-dark">E-mail :</span> ${service.contact}</p>
                                </div>
                            </div>
                        </div>
                        </div>
                    `
            
        })
        displayNotesDiv.innerHTML=html
    }

    searchServicesByState(){
        let displayNotesDiv=document.getElementById("displayNotesDiv")
        let searchForm=document.getElementById("searchForm")
        let essentialServices=JSON.parse(sessionStorage.getItem("essentialServices"))
        // let listOfAllObjectForPaginationAfterFilter = []
        searchForm.addEventListener("submit",(e)=>{
            e.preventDefault()
            let html=""
            let searchingCommand=Array.from(e.target)[0].value.toLowerCase()
            let filteredArr= []
            filteredArr = essentialServices.filter(el => el.state.toLowerCase().replace(/\s/g, "").includes(searchingCommand.replace(/\s/g, "")))
            
            filteredArr.forEach((service,index)=>{
                html +=`
                        <div class=" note_card col-lg-4 col-md-4 mb-2">
                        <div class="card-group">
                            <div class="card bg-warning text-white scroll p-3">
                                <div class="card-body">
                                    <h4  class="card-title"><span class="text-dark">Category:</span> <span class="text-uppercase text-danger"> ${service.category}</span></h4>
                                    <p id="cardtitle"><span class="text-dark">State : </span> ${service.state}</p>
                                    <p><span class="text-dark">City :</span> ${service.city}</p>
                                    <p><span class="text-dark">Organization : </span> : ${service.nameoftheorganisation}</p>
                                    <p><span class="text-dark">Description :</span> ${service.descriptionandorserviceprovided}</p>
                                    <p><span class="text-dark">Phone :</span> ${service.phonenumber}</p>
                                    <p><span class="text-dark">E-mail :</span> ${service.contact}</p>
                                </div>
                            </div>
                        </div>
                        </div>
                    `
            })
               
            displayNotesDiv.innerHTML=html  
            Array.from(e.target)[0].value=""
        })
            
    }   
}



// gotoTopbtn section starts ------------------------------------------

//Get the button
var gotoTopbtn = document.getElementById("gotoTopbtn");

// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    gotoTopbtn.style.display = "block";
  } else {
    gotoTopbtn.style.display = "none";
  }
}

// When the user clicks on the button, scroll to the top of the document
function gotoTopFunc() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
// gotoTopbtn section ends ------------------------------------------

