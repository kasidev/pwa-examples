import {showInfo} from "./showInfo.js";
import {statusInfo} from "./showInfo.js";
import {removeFavorites} from "./deleteAct.js";

export function contentFav(){  
    // Generating content based on the template
    const favoritesStored = JSON.parse(localStorage.getItem("favorites"))
    const actsSorted = acts.sort(function(a,b){return a.start-b.start})
    const template = `<div class="act">
        <div class="actName">
            <h4>ACT_NAME</h4>
        </div>
        <article>
            <div class="actData">
                <ul>
                <li>TYPE</li>
                <li><span>FROM</span> - <span>TO</span> @ <span>WHERE</span></li>
                </ul>
            </div>

            <div class="actButtons">
                <button class="round-btn" id="info_ID" data-id="ID">info</button>
                <button class="round-btn" id="remove_ID" data-id="ID">save</button>
                <button class="round-btn"><a href='MFW_LINK'>MFW</a></button>
            </div>
        </article>
    </div>`;
    let content = '';
    for (let i = 0; i < actsSorted.length; i++) {
    if (favoritesStored.list.includes(i)
        && actsSorted[i].start>=localStorage.startTime 
        && actsSorted[i].start<=localStorage.endTime) {
        let entry = template.replace(/POS/g, (i + 1))
        .replace(/ACT_NAME/g, actsSorted[i].name)
        .replace(/TYPE/g, actsSorted[i].style)
        .replace(/MFW_LINK/g, actsSorted[i].mfwLink)
        .replace(/FROM/g, moment.unix(actsSorted[i].start).format("HH:mm"))
        .replace(/TO/g, moment.unix(actsSorted[i].end).format("HH:mm"))
        .replace(/WHERE/g, stages[actsSorted[i].location-1].name)
        .replace(/ID/g, actsSorted[i].id);
        
        entry = entry.replace('<a href=\'http:///\'></a>', '-');
        content += entry;
        }
    }
    const favoritePage = document.getElementById('content-favorites');   
    favoritePage.innerHTML = content;



    for (let i = 0; i < actsSorted.length; i++) {
    const infoButton = document.getElementById(`info_${actsSorted[i].id}`)
    if (infoButton) {
        infoButton.addEventListener("click",()=>{
            showInfo(actsSorted[i].id)
        })   
    }
    
    const removeButton = document.getElementById(`remove_${actsSorted[i].id}`)
    if (removeButton) {
        removeButton.addEventListener("click",()=>{
            removeFavorites(actsSorted[i].id)

            
        })
    }

    }
    const nameField =document.getElementById("myName")
    if (localStorage.getItem("pubID")) {
        nameField.value = localStorage.myName;
        nameField.setAttribute("readonly","readonly")
    }
    
    const pubButton = document.getElementById("pub")
    if (pubButton) {
            pubButton.addEventListener("click",()=>{   
                if (!localStorage.getItem("pubID")) {
                    pubButtonEventFirst()
                }
                else{
                    console.log("allready published")
                    publishUpdate()
                }
            })
            
            

    }
    function pubButtonEventFirst(){
        let userName = document.getElementById("myName").value
        let xhrCheckName = new XMLHttpRequest
        xhrCheckName.open("GET",`https://diariumobscuri.azurewebsites.net/checkName?name=${userName}`)
        xhrCheckName.setRequestHeader('Content-Type', 'application/json') ;
        xhrCheckName.setRequestHeader('Access-Control-Allow-Origin', '*' );
        xhrCheckName.send();
        xhrCheckName.onreadystatechange = function(){
            if (xhrCheckName.readyState == 4) {
                if (JSON.parse(xhrCheckName.response)[0].nameFound == 1) {
                    alert("name schon besetzt")
                } else {
                    let favoritesStored = JSON.parse(localStorage.getItem("favorites"))
                    let xhr = new XMLHttpRequest();
                    xhr.open("POST", "https://diariumobscuri.azurewebsites.net/addEntry", true);
                    xhr.setRequestHeader('Content-Type', 'application/json') ;
                    xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
                    xhr.send(JSON.stringify({
                        "favorites": favoritesStored.list
                        ,"uploadTime" : moment().unix()
                        ,"name" : userName
                        ,"type" : "vorneLinks"
                    }));
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            console.log(JSON.parse(xhr.response).id);
                            localStorage.pubID = JSON.parse(xhr.response).id;
                            localStorage.myName = userName;
                            statusInfo(`dein Name"${userName}"wurde registriert`)
                        }
                    }
                }
                
            }
        }
        

    }
    function publishUpdate(){
        let favoritesStored = JSON.parse(localStorage.getItem("favorites"))
        let databaseID = localStorage.pubID
        let xhr = new XMLHttpRequest();
        xhr.open("POST", "https://diariumobscuri.azurewebsites.net/updateItem", true);
        xhr.setRequestHeader('Content-Type', 'application/json') ;
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
        xhr.send(JSON.stringify({
            "value": favoritesStored.list
            ,"key" : "favorites"
            ,"taskID" : databaseID
        }));
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                console.log(xhr.responseType);
                console.log(JSON.parse(xhr.response).id);
                localStorage.pubID = JSON.parse(xhr.response).id;
                statusInfo("Merkzettel veröffentlicht")
            }
        }

    }
    const friendButton = document.getElementById("getFriends")
    friendButton.addEventListener("click",()=>{
    const newFriend = document.getElementById("friendsName").value
        if (newFriend.length>0) {
            let xhrCheckName = new XMLHttpRequest
            xhrCheckName.open("GET",`https://diariumobscuri.azurewebsites.net/checkName?name=${newFriend}`)
            xhrCheckName.setRequestHeader('Content-Type', 'application/json') ;
            xhrCheckName.setRequestHeader('Access-Control-Allow-Origin', '*' );
            xhrCheckName.send(null);
            xhrCheckName.addEventListener("loadend",()=>{
                if (JSON.parse(xhrCheckName.response)[0].nameFound == 0) {
                    statusInfo(`"${newFriend}" nicht registriert`)
                }
                else{
                    let friendFav=JSON.parse(xhrCheckName.response)[1].favorites
                    let friendName=JSON.parse(xhrCheckName.response)[1].name
                    let oldList = JSON.parse(localStorage.friends)
                    let newElement = {}
                    newElement["favorites"]=friendFav
                    newElement["friendName"]=friendName
                    let check = 0
                    console.log("oldList",oldList)
                    for (let i = 0; i < oldList.length; i++) {
                        if (oldList[i].friendName == friendName){
                            check =1;
                            //console.log("element allredy in list")
                        }
                        
                    }
                    if (check==0) {
                        //console.log("new element pushed")
                        oldList.push(newElement)
                        localStorage.friends=JSON.stringify(oldList)
                        statusInfo(`"${newFriend}" als Freund*In hinzugefügt`)
                        updateFriends()

                    }
                }
                
            })  
                    
        }updateFriends()
    })
            
    function updateFriends(){    
        let newList = []
        
        let xhr = new XMLHttpRequest
        xhr.open("GET",`https://diariumobscuri.azurewebsites.net/getFriends`)
        xhr.setRequestHeader('Content-Type', 'application/json') ;
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*' );
        xhr.send(null);
        xhr.addEventListener("loadend",()=>{
            let response=JSON.parse(xhr.response)
            //console.log(response)
            for (let i_2 = 0; i_2 < response.length; i_2++) {
                for (const entry of JSON.parse(localStorage.friends)) {
                    //console.log("entry",entry,"response",response[i_2].name)
                    if (response[i_2].name == entry.friendName) {
                        //console.log("match found")
                        newList.push({
                            "friendName" : response[i_2].name,
                            "favorites" : response[i_2].favorites
                        })
                    }
                }
            }
        
        //console.log("stringified",JSON.stringify(newList),newList)
        if (JSON.stringify(newList).length>10) {
            localStorage.friends=JSON.stringify(newList)
        }
  
       
        })
    }
    const friendDeleteButton = document.getElementById("removeFriend")
    friendDeleteButton.addEventListener("click",()=>{
    const oldFriend = document.getElementById("friendsName").value
    let newList = []
    let check=0
        if (oldFriend.length>0) {
            for (const entry of JSON.parse(localStorage.friends)) {
                console.log("old friend",oldFriend,"entry",entry)
                if (oldFriend != entry.friendName) {
                    //console.log("match found")
                    newList.push({
                        "friendName" : entry.friendName,
                        "favorites" : entry.favorites
                    })
                }
                else{check=1}
            }
            if (JSON.stringify(newList).length>10) {
                localStorage.friends=JSON.stringify(newList)
            }

        }
        if (check == 0) {
            statusInfo(`"${oldFriend}" nicht gefunden`)
            
        } else {
            statusInfo(`"${oldFriend}" entfernt`)
        }
    })

}