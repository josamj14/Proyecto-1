--Postgres DB for all Restaurant tables

-- Create Users Table
CREATE TABLE Users (
    User_ID SERIAL PRIMARY KEY,  -- Auto-increment 
    "Role" VARCHAR(50) 
        CHECK ("Role" IN ('Client', 'Admin')),  -- Role can only be Client or Admin
    Username VARCHAR(100) UNIQUE NOT NULL,  -- Unique constraint on Username
    Email VARCHAR(100) UNIQUE NOT NULL,     -- Unique constraint on Email
    "Password" VARCHAR(255) NOT NULL       
);

-- Create Menu Table
CREATE TABLE Menu (
    Menu_ID SERIAL PRIMARY KEY,  -- Auto-increment 
    "Name" VARCHAR(100)
);

-- Create Products Table
CREATE TABLE Products (
    Product_ID SERIAL PRIMARY KEY,   -- Auto-increment 
    "Name" VARCHAR(255) NOT NULL,       
    "Description" TEXT,
    Menu_ID INT REFERENCES Menu(Menu_ID) ON DELETE CASCADE,           -- Foreign Key to Menu
    Price DECIMAL(10, 2) NOT NULL               
);

-- Create Restaurant Table
CREATE TABLE Restaurant (
    Restaurant_ID SERIAL PRIMARY KEY,  -- Auto-increment 
    "Name" VARCHAR(255) NOT NULL,         
    "Address" TEXT NOT NULL              
);

-- Create Menu_Restaurant Table (Relationship between Menus and Restaurants)
CREATE TABLE Menu_Restaurant (
    Restaurant_ID INT REFERENCES Restaurant(Restaurant_ID) ON DELETE CASCADE,  -- Foreign Key to Restaurant
    Menu_ID INT REFERENCES Menu(Menu_ID) ON DELETE CASCADE,                   -- Foreign Key to Menu
    PRIMARY KEY (Restaurant_ID, Menu_ID)  -- Composite Primary Key
);

-- Create Order Table
CREATE TABLE "Order" (
    Order_ID SERIAL PRIMARY KEY,   -- Auto-increment Order_ID
    "Datetime" TIMESTAMP NOT NULL,    -- Order Date and Time
    User_ID INT REFERENCES Users(User_ID) ON DELETE SET NULL,  -- Foreign Key to Users
    Restaurant_ID INT REFERENCES Restaurant(Restaurant_ID) ON DELETE CASCADE,  -- Foreign Key to Restaurant
    "Address" VARCHAR(255),
    "Status" VARCHAR(255)
);

-- Create Order_Line Table (Relation between Orders and Menu_Products)
CREATE TABLE Order_Line (
    Order_ID INT REFERENCES "Order"(Order_ID) ON DELETE CASCADE,  -- Foreign Key to Orders
    Product_ID INT REFERENCES Products(Product_ID) ON DELETE CASCADE,  -- Foreign Key to Menu_Product
    Price DECIMAL(10, 2) NOT NULL,  -- Price from Menu_Product
    PRIMARY KEY (Order_ID, Product_ID)  -- Composite Primary Key
);

-- Create Table Table (Tables available in Restaurants)
CREATE TABLE "Table" (
    Table_ID SERIAL PRIMARY KEY,   -- Auto-increment 
    Restaurant_ID INT REFERENCES Restaurant(Restaurant_ID) ON DELETE CASCADE,  -- Foreign Key to Restaurant
    Capacity INT NOT NULL,         -- Number of seats at the table
    Available BOOLEAN DEFAULT TRUE -- Whether the table is available or not
);

-- Create Reservation Table
CREATE TABLE Reservation (
    Reservation_ID SERIAL PRIMARY KEY,  -- Auto-increment 
    "Datetime" TIMESTAMP NOT NULL,         
    User_ID INT REFERENCES Users(User_ID) ON DELETE CASCADE,  -- Foreign Key to Users
    Capacity INT NOT NULL,               -- Number of people for the reservation
    Table_ID INT REFERENCES "Table"(Table_ID) ON DELETE SET NULL,  -- Foreign Key to Table
    Restaurant_ID INT REFERENCES Restaurant(Restaurant_ID) ON DELETE CASCADE  -- Foreign Key to Restaurant
);
