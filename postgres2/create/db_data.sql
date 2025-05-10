-- Insert Users into the Users Table
INSERT INTO Users ("Role", Username, Email, "Password")
VALUES 
    ('Client', 'juanperez', 'juanperez@example.com', 'password123'),
    ('Admin', 'admin1', 'admin1@example.com', 'adminpassword1'),
    ('Client', 'maria123', 'maria123@example.com', 'mariapassword'),
    ('Admin', 'admin2', 'admin2@example.com', 'adminpassword2'),
    ('Client', 'luisgomez', 'luisgomez@example.com', 'luispassword');

-- Insert Menus
INSERT INTO Menu ("Name")
VALUES 
    ('Regular Menu'),
    ('Executive Menu'),
    ('Dessert Menu'),
    ('Breakfast Menu');

-- Insert Products with correct schema
INSERT INTO Products ("Name", "Description", Menu_ID, Price)
VALUES 
    -- Regular Menu (Menu_ID = 1)
    ('Cheeseburger', 'A juicy cheeseburger with lettuce, tomato, and cheese', 1, 8.99),
    ('Grilled Chicken Sandwich', 'A delicious grilled chicken sandwich with mayo and veggies', 1, 7.99),
    ('Vegetable Salad', 'A fresh salad with a variety of vegetables', 1, 5.99),
    ('French Fries', 'Crispy, golden French fries', 1, 2.99),

    -- Executive Menu (Menu_ID = 2)
    ('Grilled Chicken Sandwich', 'A delicious grilled chicken sandwich with mayo and veggies', 2, 6.99),
    ('Pasta Alfredo', 'Creamy Alfredo pasta with parmesan and chicken', 2, 8.99),
    ('Chocolate Cake', 'Rich and moist chocolate cake with frosting', 2, 5.99),

    -- Dessert Menu (Menu_ID = 3)
    ('Chocolate Cake', 'Rich and moist chocolate cake with frosting', 3, 6.99),
    ('Fruit Salad', 'A refreshing mix of seasonal fruits', 3, 4.99),

    -- Breakfast Menu (Menu_ID = 4)
    ('Pancakes', 'Fluffy pancakes with maple syrup and butter', 4, 5.99),
    ('Eggs and Bacon', 'Classic eggs and crispy bacon', 4, 6.99),
    ('Coffee', 'Freshly brewed coffee with your choice of milk or cream', 4, 2.99);


-- Insert Restaurants with Computer Science Themed Names
INSERT INTO Restaurant ("Name", "Address")
VALUES 
    ('The Silicon Byte', '101 Tech Lane, Code City, Silicon Valley'),
    ('Code & Coffee', '1 GitHub Way, Hackertown, Git Branch'),
    ('Cache & Cookies', '128 RAM Boulevard, RAMtown, Cacheville'),
    ('The Python Pit', '0x0 Python Blvd, Scripting City, Byte Town'),
    ('Java Beans Cafe', '102 Java Lane, OOP Park, Code Island');

-- Insert Menu_Restaurant data
INSERT INTO Menu_Restaurant (Restaurant_ID, Menu_ID)
VALUES 
    (1, 1),  -- The Silicon Byte offers "Regular Menu"
    (1, 2),  -- The Silicon Byte offers "Executive Menu"
    (2, 1),  -- Code & Coffee offers "Regular Menu"
    (2, 4),  -- Code & Coffee offers "Breakfast Menu"
    (3, 1),  -- Cache & Cookies offers "Regular Menu"
    (3, 3),  -- Cache & Cookies offers "Dessert Menu"
    (4, 2),  -- The Python Pit offers "Executive Menu"
    (4, 3),  -- The Python Pit offers "Dessert Menu"
    (5, 4);  -- Java Beans Cafe offers "Breakfast Menu"

-- Insert Orders
INSERT INTO "Order" ("Datetime", User_ID, Restaurant_ID)
VALUES 
    ('2025-03-17 12:30:00', 1, 1),  -- User 1 placed an order at The Silicon Byte
    ('2025-03-17 13:00:00', 2, 3);  -- User 2 placed an order at Cache & Cookies

-- Insert Order_Lines for the orders
INSERT INTO Order_Line (Order_ID, Product_ID, Price)
VALUES 
    (1, 1, 8.99),  -- Order 1: Cheeseburger from Regular Menu at The Silicon Byte
    (1, 2, 7.99),  -- Order 1: Grilled Chicken Sandwich from Regular Menu at The Silicon Byte
    (2, 3, 5.99);  -- Order 2: Vegetable Salad from Regular Menu at Cache & Cookies

-- Insert Tables in Restaurants
INSERT INTO "Table" (Restaurant_ID, Capacity, Available)
VALUES 
    (1, 4, TRUE),  -- Table 1 at The Silicon Byte, 4 seats, available
    (1, 2, FALSE), -- Table 2 at The Silicon Byte, 2 seats, not available
    (2, 4, TRUE),  -- Table 3 at Code & Coffee, 4 seats, available
    (2, 2, TRUE),  -- Table 4 at Code & Coffee, 2 seats, available
    (3, 6, TRUE),  -- Table 5 at Cache & Cookies, 6 seats, available
    (3, 2, FALSE), -- Table 6 at Cache & Cookies, 2 seats, not available
    (4, 4, TRUE),  -- Table 7 at The Python Pit, 4 seats, available
    (4, 4, FALSE), -- Table 8 at The Python Pit, 4 seats, not available
    (5, 6, TRUE),  -- Table 9 at Java Beans Cafe, 6 seats, available
    (5, 2, TRUE);  -- Table 10 at Java Beans Cafe, 2 seats, available

-- Insert Reservations
INSERT INTO Reservation ("Datetime", User_ID, Capacity, Table_ID, Restaurant_ID)
VALUES 
    ('2025-03-17 19:00:00', 1, 4, 1, 1),  -- User 1 reserved Table 1 at The Silicon Byte
    ('2025-03-17 20:00:00', 2, 2, 4, 3);  -- User 2 reserved Table 4 at Cache & Cookies
