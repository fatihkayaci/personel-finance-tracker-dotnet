# Personal Finance Tracker - .NET

A comprehensive personal finance management application built with ASP.NET Core MVC, designed to help users track their income, expenses, and financial goals with an intuitive and secure interface.

## 🚀 Features

- **Transaction Management**: Create, edit, and delete income/expense transactions
- **Category Organization**: Organize transactions with customizable categories
- **Dashboard Overview**: Real-time financial insights and summary statistics
- **User Authentication**: Secure user registration and login system
- **Account Management**: Personal profile and settings management
- **Responsive Design**: Mobile-friendly interface for on-the-go access

## 🛠️ Technology Stack

- **Backend**: ASP.NET Core 9.0 MVC
- **Database**: Microsoft SQL Server
- **ORM**: Entity Framework Core
- **Authentication**: ASP.NET Core Identity
- **Frontend**: HTML5, CSS3, Bootstrap, JavaScript
- **Architecture**: Repository Pattern, Service Layer, Controller Layer

## 📋 Prerequisites

- [.NET 9.0 SDK](https://dotnet.microsoft.com/download)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (LocalDB or Express)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/fatihkayaci/personel-finance-tracker-dotnet.git
   cd personel-finance-tracker-dotnet
   ```

2. **Configure Database Connection**
   
   Update the connection string in `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PersonalFinanceTrackerDb;Trusted_Connection=true;MultipleActiveResultSets=true"
     }
   }
   ```

3. **Install Dependencies**
   ```bash
   dotnet restore
   ```

4. **Apply Database Migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the Application**
   ```bash
   dotnet run
   ```

6. **Access the Application**
   
   Navigate to `https://localhost:5001` in your browser

## 🏗️ Project Structure

```
PersonalFinanceTracker/
├── Controllers/           # MVC Controllers
├── Models/               # Data Models
├── Views/                # Razor Views
├── Services/             # Business Logic Layer
├── Repository/           # Data Access Layer
├── Interface/            # Service & Repository Interfaces
├── Data/                 # Entity Framework DbContext
├── wwwroot/             # Static Files (CSS, JS, Images)
```

## 📊 Database Schema

### Core Entities
- **Users**: User authentication and profile information
- **Transactions**: Financial transaction records
- **Categories**: Transaction categorization
- **Accounts**: User account management

## 🔐 Security Features

- User authentication with ASP.NET Core Identity
- Password hashing and security
- Session management
- CSRF protection
- Input validation and sanitization

## 🎯 Planned Features

- [ ] Financial Reports & Analytics
- [ ] Budget Planning & Tracking
- [ ] Data Export (PDF, Excel)
- [ ] Multi-currency Support
- [ ] Mobile Application
- [ ] API Development

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Fatih KAYACI**
- GitHub: [@fatihkayaci](https://github.com/fatihkayaci)
- LinkedIn: [Fatih Kayacı](https://www.linkedin.com/in/fatih-kayaci-79180a28a/)
- Email: fatihkayaci@yahoo.com

## 🙏 Acknowledgments

- ASP.NET Core documentation and community
- Bootstrap for responsive design components
- Microsoft SQL Server for reliable data storage

---

⭐ **If you found this project helpful, please give it a star!**
