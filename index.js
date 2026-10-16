require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const fs = require('fs');

// Basic Configuration
const port = process.env.PORT || 3000;

const db = `${process.cwd()}/db/database.json`

// setup
const createDB = function (){
  fs.appendFile(db, '[]', (err)=>{
    if(err)console.log('error generating database file');
  })
}

const save = (newData)=>{
  if(!newData)return
  fs.readFile(db, 'utf8', (err, data)=>{
    if (err) return console.log('error occured loading db')
    else {
      if(newData){
        console.log(typeof(JSON.parse(data)))
        const updatedDB = JSON.parse(data).concat(newData)

        fs.writeFile(db, JSON.stringify(updatedDB), (err)=>{
          if(err)console.log('error saving data to db')
        })

        return updatedDB
      }
      else return data
  }
  })
}
const find = async (short_url)=>{
  if(!short_url){
    return console.log('short url is required')
  }
  
  
  const data = await fs.promises.readFile(db, 'utf8')
  const urls = JSON.parse(data)
  const url = urls.find((url)=>url.short_url === short_url)

  return url;
} 

const checkDB = ()=>{
  if(!fs.existsSync(db)){
    console.log(`database doesnt exist, genereting ...`)
    createDB()
  }
  else console.log('database exists')
}


checkDB()



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.post('/api/shorturl', function(req,res){

  const original_url = req.body.url;
   console.log(original_url)

  const short_url = Math.floor(Math.random() * 10000).toString();
  console.log(short_url)

  if(original_url.match(/^(http|https):\/\/[^ "]+$/) === null){
    console.log(`the provided url is invalid`)
    return res.json({error: 'invalid url'})
  }
  const url = {
    short_url,
    original_url
  }
  
  fs.appendFile(db, `${save(url)}`, (err)=>{
    if(err)console.log('error saving data to db')
  })

  res.json({short_url: req.headers.host + '/api/wait/' + short_url});
})

app.get('/api/wait/:short_url', (req,res)=>{
  res.sendFile(process.cwd() + '/views/waitingpage.html');
})

app.get('/api/redirect/:url', (req,res)=>{
  const short_url = req.params.url;
  console.log(`short url is ${short_url}`)
  find(short_url).then((url)=>{
    if(!url){
      return res.json({error: 'No short url found for the given input'})
    }
    else{
      return res.redirect(url.original_url)
    }
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});