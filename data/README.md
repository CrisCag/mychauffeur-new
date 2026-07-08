# Directory `data/`

## File versionati (config tariffaria)

Questi file **possono** essere committati: contengono solo regole di business, non dati clienti.

| File | Scopo |
|------|--------|
| `wait-time-rates.json` | Tariffe attesa per fascia oraria e veicolo |
| `comfort-mode-config.json` | Markup VIP No Rush |
| `*.example.json` | Strutture vuote per bootstrap locale |

## File runtime (mai committare)

Generati in locale o in deploy; possono contenere **PII** (indirizzi, email, telefono) e dati operativi (corsa, GPS).

| File | Scopo |
|------|--------|
| `booking-requests.json` | Richieste prenotazione |
| `operational-trips.json` | Corse operative, sessioni attesa, ping GPS |

Entrambi sono elencati in `.gitignore`. Alla prima esecuzione l’app crea i file se mancanti.

## Bootstrap locale

```bash
cp data/booking-requests.example.json data/booking-requests.json
cp data/operational-trips.example.json data/operational-trips.json
```

Non copiare mai file runtime da backup o da altri ambienti nel repository Git.
