This project is a semester-long effort to help cities manage waste more efficiently using our custom-built ultrasound IoT devices to track how full trash bins get and send real-time data for analysis. 

Check it out live: [Binify](https://binify.krystof-rezac.cz/)

## The team
**Programmers:**  
- Adam Zacios (me)
- [Kryštof Řezáč](https://github.com/krystofrezac)
- [Petr Valík](https://github.com/PetrValik) 
- [Michal Kubiče](https://github.com/MichalKubice)  

**Device Engineer & Firmware developer:**
- [Jan Ligač](https://github.com/ZeeCapp)

**Analytics and Technical Documenters:**
- [Alexandr Kuryshev](https://github.com/ChaserSoD)
- [Matěj Musil](https://github.com/ShutenDoji9)
- [William Ngwena](https://github.com/Willson22)
- [Jan Alexandr Motyčka](https://github.com/JanAlexandrMotycka)

---

## 🚀 Concept

Ever walked by an overflowing trash bin? Binify fixes that. We attach an ultrasound sensor to each bin’s lid and link it to our web app. The sensor measures how full the bin is and sends data instantly. 

- **Track fullness over time**  
- **Get alerts** when bins reach set levels  
- **See trends** with easy-to-read graphs

Alerts come through a Telegram bot—choose your own fullness thresholds and get notified the moment a bin is too full.

Below is a high-level overview of how it all works:

![High-level diagram](https://github.com/user-attachments/assets/a856b40a-0f8a-4f93-9cc9-cdf2fdf724cd)

---

## 🔧 How It Works

1. **Create an Organization**  
   - Think of this as your group—company, city district, or team.  
   - You invite members and assign roles:
     - **Admin:** Can add or remove devices, set alerts, and view data.  
     - **Viewer:** Can only see data and receive alerts.

2. **Activate a Bin**  
   - An admin follows a short setup guide to link the ultrasound device to the app.  
   - Data starts flowing right away.

3. **View Data**  
   - Go to **Organization Bins** or **Device Detail** to see fullness graphs.  
   - Choose from:
     - Last 5 minutes  
     - Last 24 hours  
     - Last 7 days  
     - Last 30 days

   Each view adjusts how data points (ticks) are grouped—e.g., 30-second intervals for 5 minutes, daily ticks for 7 days.

   ![Fullness graph](https://github.com/user-attachments/assets/e995a4ac-25e8-412f-9385-73ab00c699f9)

4. **Set Alerts**  
   - Pick a fullness threshold (e.g., 80%).  
   - Link your Telegram channel in just a couple of clicks:
     1. Click the link in the alert settings.  
     2. Paste the code from our site into the Telegram chat.  
   - Get a message when the bin goes over your chosen level.  
   - You can also set reminders until the bin is empty again.

---
## 🛠️ Tech Stack

### Database  
- **PostgreSQL** with **TimescaleDB**  
- **Prisma** ORM  
- Tables include:  
  `User`, `MicrosoftLogin`, `Organization`, `Member`, `Bin`, `ActivatedBin`, `Measurement`, `AlertSource`, and more.

### Backend  
- **Node.js** + **TypeScript**  
- **Express**, **tRPC**, **Passport**  
- **Zod** for validation  
- **neverthrow** for errors  
- **JWT** for auth  
- **Telegram Bot API** for alerts

### Frontend  
- **React** + **TypeScript**  
- **Vite**, **Biome**  
- **Tailwind CSS**, **Radix UI**, **shadcn**  
- **tRPC**, **TanStack Query** for data fetching

### Firmware  
- **Zig**, **Pico-SDK**

### IoT Hardware  
- **Raspberry Pi Pico** + **PIC12 coprocessor**  
- **Ultrasound sensor** HC-SR04 RCWL-9610  
- **Air quality sensor** MQ-135  

> This is our IoT device without a plastic cover, don’t mind the box in this photo - it was just to simulate a full bin!  
> ![IoT device](https://github.com/user-attachments/assets/ad04139b-43a9-414d-8a6f-a277af75ea7f)

---

## Possible future development
- Route optimisations for waste disposal companies => Only drive where the bins are above a certain threshold => save time & money
- Predictive data analysis
- Heatmaps of waste bin usage
- Device tinkering - better battery life, LPWAN solution
