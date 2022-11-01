# deva.world

The deva.world User Interface

## summary

The DevaUI allows you to interact with various DEVA Agents and to enter the Deva World Virtual Realm. The DevaUI is easy to launch and begin to use with just a little technical knowledge of NodeJS and basic ability to change a few code files.

## Install

First you will close the repository into your desired location.

```bash
$ git clone git@github.com:indraai/deva.world.git
```

After you have cloned the repository to your desired location then install the necessary components.

```bash
$ cd deva.world
$ npm i
```

## edit client.json

In the data direcotry create a `./data/client.json` file that you will need to edit the values. Once you launch the system make a new client id with the `!bang` command and put that into the id of the client file. Then change the necessary information in the client file to get started.

### client.json sample
Below is a smaple of the basic client.json file you can put into your data directory to get started. OTher services will require additional values.

```json
{
  "name": "CLIENT",
  "describe": "CLIENT FILE",
  "copyright": "Copyright ©2022 Quinn Michaels. All rights reserved.",
  "DATA": {
    "id": *generate*new*uid*,
    "key": "*user*key*",
    "name": "*your*short*name*",
    "describe": "*your*description*",
    "prompt": {
      "emoji": "🖥",
      "text": "*shell*label*",
      "colors": {
        "label": {
          "R": 255,
          "G": 163,
          "B": 41
        },
        "text": {
          "R": 255,
          "G": 173,
          "B": 67
        }
      }
    },
    "profile": {
      "emoji": "*your*emoji*image*",
      "avatar": "*your*avatar*image*",
      "background": "*your*background*url*",
      "name": "*your*full*name*",
      "describe": "*your*profile*descriptoin*",
      "gender": "*your*gender*",
      "lang": "en"
    },
    "services": {
      "world": "https://indra.ai/deva.world",
      "space": "https://indra.ai/deva.space",
      "cloud": "https://indra.ai/deva.cloud",
      "mud": {
        "key": "user",
        "host": "arjika.deva.cloud",
        "port": 9003,
        "user": {
          "login": "*your*username*",
          "password": "*your*password*"
        },
      }
    }
  }
}
```

## Launch Application

Once you have edited your `./data/client.json` file then start the application with the `npm start` command. This will launch your server and tell you in the terminal what address and port to load the browser interface.

From here in the terminal you can interact in the shell or load a web browser with the address provided at launch.

Once you are in the system issue the `!help` command for more information on what todo next.

---

[Github Repo](https://github.com/indraai/deva.world)  
[Back to indra.ai](https://indra.ai)  
&copy;2022 Quinn Michaels; All Rights Reserved.
