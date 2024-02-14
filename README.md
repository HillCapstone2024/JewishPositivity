# JewishPositivity

## Contributors

- Jessica Yasi
- Jacob Pacheco
- Molly Nelson
- Dan Cox
- Lorelie Murphy
- Zach Fisher
- Roman Galeano
- Alex Gallant
- Diego Gonzalez-Tellez
- Jahiem Law
- Caitlin Nolan
- Nick Samios
- Tiziana Hernandez
- Brian Farrell
- Ryan Barry

## Getting Setup

Clone this repository to your local machine.

```bash
git clone https://github.com/HillCapstone2024/JewishPositivity.git
```

Install [VS Code](https://code.visualstudio.com/download)

Add the following extensions:

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [Django](https://marketplace.visualstudio.com/items?itemName=batisteo.vscode-django)
- [Pylance](https://marketplace.visualstudio.com/items?itemName=ms-python.vscode-pylance)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [Git Graph](https://marketplace.visualstudio.com/items?itemName=mhutchie.git-graph)
- [Github Actions](https://marketplace.visualstudio.com/items?itemName=GitHub.vscode-github-actions)

Download [Python 3.12.2](https://www.python.org/downloads/)

Download [NodeJS 20.11.0](https://nodejs.org/en/download/)

Make sure your pip and npm installers are up to date

```bash
python -m pip install --upgrade pip
npm install npm@latest -g
```

For Mac, if you get an error involving permissions after this npm command or after `npm install`, try `npm install -g npm@latest --unsafe-perm=true --allow-root`. If you encounter an error with pip or python not being recognized, try python3 and pip3 instead. To change your path to use python and pip instead follow these steps:

- In the bash terminal, run: `nano ~/.bash_profile`
- Add the below lines to the file that opens:

    ```bash
    alias python='python3'
    alias pip='pip3'
    ```

- Close the file with ctrl+X and then press Y to save the changes and press enter to return to the terminal
- Run the command `source ~/.bash_profile` to update the terminal or just open a new one

install Django and other pip packages

```bash
pip install -r requirements.txt
```

install NodeJs packages

```bash
cd React_Native
npm install
```

download the Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779), [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

For working with the database, install [MySQL Workbench](https://www.mysql.com/products/workbench/).

## Running the Project

### Backend

```bash
cd Django
python manage.py runserver
```
### Adding Unit tests to the Pipeline

For any python unit tests, be sure to add them to the Django folder so they can be properly accessed by the pipeline files. Then to add
the tests to the suite, open the folder under the JewishPositivity repo called .github\workflows (\GitHub\JewishPositivity\.github\workflows). In this folder you will find a django.yml file. Within this file, scroll to the bottom of the page where you can find a section with the name: Run Tests. Underneath there is a run section with a default python test called manage.py. Copy the same syntax as that for your own tests, BE SURE TO COMMIT AND PUSH YOUR TESTS TO THE REPOSITORY BEFORE ADDING THEM TO THE PIPELINE, and add it with the same indentation as the previous tests. For example, "python mytest.py test" would run perfectly fine on the pipeline. After the test is added, save the file and do a push in the JewishPositivity folder to save those changes and your test will run on the pipeline whenever code is pushed to the repository.

If you have any pipeline questions send the tools a message on Slack and they can try and fix any issues you may be having

### Frontend

```bash
cd React_Native
npx expo start
```

A QR code will appear in the terminal, scan the QR code to run the app on your phone in Expo Go. If you're having issues with loading the app on Expo Go, try running `npx expo start --tunnel` instead. This should help on restricted networks like Hillspot. The first time you run the line, it may ask to install `@expo/ngrok@^4.1.0` - make sure to accept the global installation of this package.

After starting the Django server, if you encounter this error: `You have 18 unapplied migration(s). Your project may not work properly until you apply the migrations for app(s): admin, auth, contenttypes, sessions.`, you should run `python manage.py migrate` to apply them.

MAC Installing `mysqlclient`:
Follow [this guide](https://gist.github.com/ShirishRam/99fc3def9d35e75e96a562f0524b0d46)
With the lib= step, 
- make sure you add the line with the line: `vi` path from `which mysql_config` 
- To find the line, type `/libs` to find the place in the document
- Press I to enter insert mode, copy and paste the what the guide tells you to, comment out the line it says to replace. (try sudo if necessary)
- Exit with escape, then `:wq!`

If it still doesn't work, follow these steps as well:
- Get the path for the config file with: `mysql_config --cflags`
- Type this command: `export MYSQLCLIENT_CFLAGS=` "path from above"
- Same thing for library: `mysql_config --libs`
    `export MYSQLCLIENT_LDFLAGS=` "path from above"
Try these commands as well
- `export CFLAGS="-D__x86_64__"`
- `export ARCHFLAGS="-arch x86_64"`
Re-try `pip install mysqlclient`
