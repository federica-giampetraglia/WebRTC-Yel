# Installazione di Yel

Questo documento descrive i passaggi necessari per configurare l'ambiente di sviluppo e di esecuzione per il progetto Yel. Assicurati di avere `git`, `MongoDB` e `Node.js` con `npm` installati sul tuo sistema prima di iniziare.

## Clonazione del Repository

Inizia clonando il repository del progetto sul tuo sistema. Apri un terminale e inserisci il seguente comando:

```bash
git clone https://github.com/federica-giampetraglia/WebRTC-Yel
```

## Installazione delle Dipendenze

Dopo aver clonato il repository, devi installare le dipendenze necessarie per il server e il client.

### Dipendenze Server

Spostati nella directory del progetto e installa le dipendenze di Node.js con il comando:

```bash
npm install
```

### Dipendenze Client

Per installare le dipendenze necessarie al client, esegui:

```bash
cd client
npm install
```

## Avvio del Server

Una volta completata l'installazione delle dipendenze, puoi avviare il server con il seguente comando:

```bash
cd ..
npm start
```

Questo avvierà il server e il client. Il server ascolta sulla porta definita nel file di configurazione del progetto. Assicurati che le porte `3000` e `3030` siano libere e non utilizzate da altri servizi.

