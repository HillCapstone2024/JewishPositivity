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

### Frontend

```bash
cd React_Native
npx expo start
```

A QR code will appear in the terminal, scan the QR code to run the app on your phone in Expo Go. If you're having issues with loading the app on Expo Go, try running `npx expo start --tunnel` instead. This should help on restricted networks like Hillspot. The first time you run the line, it may ask to install `@expo/ngrok@^4.1.0` - make sure to accept the global installation of this package.

After starting the Django server, if you encounter this error: `You have 18 unapplied migration(s). Your project may not work properly until you apply the migrations for app(s): admin, auth, contenttypes, sessions.`, you should run `python manage.py migrate` to apply them.
