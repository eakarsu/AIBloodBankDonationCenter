const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = require('../db');
const bcrypt = require('bcryptjs');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Dropping existing tables...');
    await client.query(`
      DROP TABLE IF EXISTS rewards CASCADE;
      DROP TABLE IF EXISTS drives CASCADE;
      DROP TABLE IF EXISTS staff CASCADE;
      DROP TABLE IF EXISTS equipment CASCADE;
      DROP TABLE IF EXISTS reactions CASCADE;
      DROP TABLE IF EXISTS transportation CASCADE;
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS inventory CASCADE;
      DROP TABLE IF EXISTS components CASCADE;
      DROP TABLE IF EXISTS blood_tests CASCADE;
      DROP TABLE IF EXISTS collections CASCADE;
      DROP TABLE IF EXISTS deferrals CASCADE;
      DROP TABLE IF EXISTS screenings CASCADE;
      DROP TABLE IF EXISTS donations CASCADE;
      DROP TABLE IF EXISTS donors CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log('All tables dropped.');

    // ── Create Tables ──────────────────────────────────────────────────

    console.log('Creating tables...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS donors (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        date_of_birth DATE NOT NULL,
        gender VARCHAR(10),
        blood_type VARCHAR(5),
        rh_factor VARCHAR(10),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(50),
        zip VARCHAR(10),
        emergency_contact VARCHAR(255),
        emergency_phone VARCHAR(20),
        total_donations INT DEFAULT 0,
        last_donation_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS donations (
        id SERIAL PRIMARY KEY,
        donor_id INT REFERENCES donors(id),
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        donation_type VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'scheduled',
        location VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS screenings (
        id SERIAL PRIMARY KEY,
        donor_id INT REFERENCES donors(id),
        screening_date DATE NOT NULL,
        temperature DECIMAL(4,1),
        blood_pressure_systolic INT,
        blood_pressure_diastolic INT,
        pulse INT,
        hemoglobin DECIMAL(4,1),
        weight DECIMAL(5,1),
        travel_history TEXT,
        medication_list TEXT,
        recent_illness BOOLEAN DEFAULT false,
        recent_surgery BOOLEAN DEFAULT false,
        recent_tattoo BOOLEAN DEFAULT false,
        pregnant BOOLEAN DEFAULT false,
        result VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS deferrals (
        id SERIAL PRIMARY KEY,
        donor_id INT REFERENCES donors(id),
        deferral_type VARCHAR(20) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        deferral_date DATE NOT NULL,
        end_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        donor_id INT REFERENCES donors(id),
        donation_id INT REFERENCES donations(id),
        collection_type VARCHAR(50) NOT NULL,
        bag_number VARCHAR(50) UNIQUE NOT NULL,
        volume_ml INT,
        phlebotomist VARCHAR(100),
        station_number INT,
        start_time TIMESTAMP,
        end_time TIMESTAMP,
        status VARCHAR(20) DEFAULT 'completed',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS blood_tests (
        id SERIAL PRIMARY KEY,
        collection_id INT REFERENCES collections(id),
        bag_number VARCHAR(50),
        abo_type VARCHAR(5),
        rh_type VARCHAR(10),
        antibody_screen VARCHAR(20),
        hiv_test VARCHAR(20),
        hepatitis_b VARCHAR(20),
        hepatitis_c VARCHAR(20),
        syphilis_test VARCHAR(20),
        zika_test VARCHAR(20),
        wnv_test VARCHAR(20),
        test_date DATE,
        tested_by VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS components (
        id SERIAL PRIMARY KEY,
        collection_id INT REFERENCES collections(id),
        component_type VARCHAR(50) NOT NULL,
        bag_number VARCHAR(50),
        volume_ml INT,
        preparation_date DATE,
        expiration_date DATE,
        storage_temp VARCHAR(20),
        status VARCHAR(20) DEFAULT 'available',
        quality_check VARCHAR(20) DEFAULT 'pending',
        processed_by VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        component_id INT,
        blood_type VARCHAR(5) NOT NULL,
        rh_factor VARCHAR(10) NOT NULL,
        product_type VARCHAR(50) NOT NULL,
        units_available INT NOT NULL,
        unit_number VARCHAR(50),
        collection_date DATE,
        expiration_date DATE NOT NULL,
        storage_location VARCHAR(100),
        temperature DECIMAL(4,1),
        status VARCHAR(20) DEFAULT 'available',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        hospital_name VARCHAR(255) NOT NULL,
        hospital_contact VARCHAR(255),
        blood_type VARCHAR(5) NOT NULL,
        rh_factor VARCHAR(10) NOT NULL,
        product_type VARCHAR(50) NOT NULL,
        units_requested INT NOT NULL,
        units_fulfilled INT DEFAULT 0,
        priority VARCHAR(20) DEFAULT 'routine',
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        needed_by DATE,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transportation (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id),
        courier_name VARCHAR(100),
        vehicle_id VARCHAR(50),
        departure_time TIMESTAMP,
        arrival_time TIMESTAMP,
        origin VARCHAR(255),
        destination VARCHAR(255),
        temperature_log TEXT,
        status VARCHAR(20) DEFAULT 'in_transit',
        chain_of_custody TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS reactions (
        id SERIAL PRIMARY KEY,
        donor_id INT REFERENCES donors(id),
        collection_id INT REFERENCES collections(id),
        reaction_type VARCHAR(100) NOT NULL,
        severity VARCHAR(20) NOT NULL,
        symptoms TEXT,
        onset_time TIMESTAMP,
        treatment TEXT,
        outcome VARCHAR(50),
        reported_by VARCHAR(100),
        status VARCHAR(20) DEFAULT 'reported',
        follow_up_required BOOLEAN DEFAULT false,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS equipment (
        id SERIAL PRIMARY KEY,
        equipment_name VARCHAR(255) NOT NULL,
        equipment_type VARCHAR(100) NOT NULL,
        serial_number VARCHAR(100),
        location VARCHAR(100),
        last_calibration DATE,
        next_calibration DATE,
        calibrated_by VARCHAR(100),
        calibration_status VARCHAR(20) DEFAULT 'current',
        maintenance_notes TEXT,
        manufacturer VARCHAR(255),
        model VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS staff (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(20),
        certification_type VARCHAR(100),
        certification_number VARCHAR(100),
        certification_date DATE,
        expiration_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        department VARCHAR(100),
        supervisor VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS drives (
        id SERIAL PRIMARY KEY,
        drive_name VARCHAR(255) NOT NULL,
        organization VARCHAR(255),
        location VARCHAR(255) NOT NULL,
        address TEXT,
        drive_date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        coordinator VARCHAR(100),
        goal_units INT,
        collected_units INT DEFAULT 0,
        volunteers_needed INT,
        volunteers_confirmed INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'planned',
        equipment_list TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        donor_id INT REFERENCES donors(id),
        reward_type VARCHAR(100) NOT NULL,
        points INT DEFAULT 0,
        milestone VARCHAR(100),
        description TEXT,
        earned_date DATE,
        redeemed BOOLEAN DEFAULT false,
        redeemed_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('All tables created.');

    // ── Seed Users ─────────────────────────────────────────────────────

    console.log('Seeding users...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO users (email, password_hash, name, role) VALUES
        ('admin@bloodbank.com', $1, 'System Administrator', 'admin')
    `, [hashedPassword]);
    console.log('Users seeded.');

    // ── Seed Donors ────────────────────────────────────────────────────

    console.log('Seeding donors...');
    await client.query(`
      INSERT INTO donors (first_name, last_name, date_of_birth, gender, blood_type, rh_factor, email, phone, address, city, state, zip, emergency_contact, emergency_phone, total_donations, last_donation_date, status) VALUES
        ('James', 'Mitchell', '1985-03-14', 'Male', 'O', 'positive', 'james.mitchell@email.com', '(512) 555-0101', '1420 Elm Street', 'Austin', 'TX', '78701', 'Linda Mitchell', '(512) 555-0102', 8, '2024-11-15', 'active'),
        ('Maria', 'Gonzalez', '1990-07-22', 'Female', 'A', 'positive', 'maria.gonzalez@email.com', '(713) 555-0201', '2850 Oak Avenue', 'Houston', 'TX', '77001', 'Carlos Gonzalez', '(713) 555-0202', 5, '2024-10-20', 'active'),
        ('David', 'Chen', '1978-11-05', 'Male', 'B', 'positive', 'david.chen@email.com', '(214) 555-0301', '763 Maple Drive', 'Dallas', 'TX', '75201', 'Wei Chen', '(214) 555-0302', 12, '2024-12-01', 'active'),
        ('Sarah', 'Johnson', '1992-01-30', 'Female', 'AB', 'positive', 'sarah.johnson@email.com', '(210) 555-0401', '1501 Pine Road', 'San Antonio', 'TX', '78201', 'Mike Johnson', '(210) 555-0402', 3, '2024-09-10', 'active'),
        ('Robert', 'Williams', '1988-06-18', 'Male', 'O', 'negative', 'robert.williams@email.com', '(512) 555-0501', '890 Cedar Lane', 'Austin', 'TX', '78702', 'Jane Williams', '(512) 555-0502', 15, '2025-01-05', 'active'),
        ('Emily', 'Davis', '1995-09-12', 'Female', 'A', 'negative', 'emily.davis@email.com', '(817) 555-0601', '2234 Birch Blvd', 'Fort Worth', 'TX', '76101', 'Tom Davis', '(817) 555-0602', 2, '2024-08-25', 'active'),
        ('Michael', 'Brown', '1982-04-08', 'Male', 'B', 'negative', 'michael.brown@email.com', '(915) 555-0701', '456 Walnut St', 'El Paso', 'TX', '79901', 'Susan Brown', '(915) 555-0702', 7, '2024-11-28', 'active'),
        ('Jennifer', 'Martinez', '1993-12-25', 'Female', 'AB', 'negative', 'jennifer.martinez@email.com', '(361) 555-0801', '3321 Spruce Way', 'Corpus Christi', 'TX', '78401', 'Rosa Martinez', '(361) 555-0802', 4, '2024-10-05', 'active'),
        ('William', 'Anderson', '1975-08-20', 'Male', 'O', 'positive', 'william.anderson@email.com', '(806) 555-0901', '1678 Ash Court', 'Lubbock', 'TX', '79401', 'Karen Anderson', '(806) 555-0902', 20, '2025-01-12', 'active'),
        ('Jessica', 'Taylor', '1998-02-14', 'Female', 'A', 'positive', 'jessica.taylor@email.com', '(956) 555-1001', '4512 Willow Dr', 'McAllen', 'TX', '78501', 'Mark Taylor', '(956) 555-1002', 1, '2024-12-18', 'active'),
        ('Christopher', 'Thomas', '1987-05-31', 'Male', 'B', 'positive', 'chris.thomas@email.com', '(432) 555-1101', '789 Poplar Ave', 'Midland', 'TX', '79701', 'Lisa Thomas', '(432) 555-1102', 6, '2024-11-03', 'active'),
        ('Amanda', 'Jackson', '1991-10-16', 'Female', 'O', 'positive', 'amanda.jackson@email.com', '(903) 555-1201', '2345 Hickory Ln', 'Tyler', 'TX', '75701', 'Steve Jackson', '(903) 555-1202', 9, '2025-01-20', 'active'),
        ('Daniel', 'White', '1980-07-04', 'Male', 'A', 'negative', 'daniel.white@email.com', '(254) 555-1301', '567 Chestnut St', 'Waco', 'TX', '76701', 'Nancy White', '(254) 555-1302', 11, '2024-12-08', 'active'),
        ('Lauren', 'Harris', '1996-03-28', 'Female', 'AB', 'positive', 'lauren.harris@email.com', '(940) 555-1401', '1890 Magnolia Rd', 'Denton', 'TX', '76201', 'Paul Harris', '(940) 555-1402', 2, '2024-09-30', 'active'),
        ('Kevin', 'Clark', '1984-11-11', 'Male', 'O', 'negative', 'kevin.clark@email.com', '(325) 555-1501', '3456 Sycamore Blvd', 'Abilene', 'TX', '79601', 'Diane Clark', '(325) 555-1502', 14, '2025-01-25', 'active'),
        ('Priya', 'Patel', '1994-06-09', 'Female', 'B', 'positive', 'priya.patel@email.com', '(512) 555-1601', '7821 Congress Ave', 'Austin', 'TX', '78745', 'Raj Patel', '(512) 555-1602', 3, '2024-10-14', 'active')
    `);
    console.log('Donors seeded.');

    // ── Seed Donations ─────────────────────────────────────────────────

    console.log('Seeding donations...');
    await client.query(`
      INSERT INTO donations (donor_id, scheduled_date, scheduled_time, donation_type, status, location, notes) VALUES
        (1, '2024-11-15', '09:00', 'whole_blood', 'completed', 'Main Center - Austin', NULL),
        (2, '2024-10-20', '10:30', 'whole_blood', 'completed', 'Main Center - Houston', NULL),
        (3, '2024-12-01', '08:00', 'platelets', 'completed', 'Main Center - Dallas', 'Regular platelet donor'),
        (4, '2024-09-10', '14:00', 'plasma', 'completed', 'Mobile Unit - San Antonio', NULL),
        (5, '2025-01-05', '11:00', 'double_red', 'completed', 'Main Center - Austin', NULL),
        (6, '2024-08-25', '09:30', 'whole_blood', 'completed', 'Main Center - Fort Worth', NULL),
        (7, '2024-11-28', '13:00', 'whole_blood', 'completed', 'Mobile Unit - El Paso', NULL),
        (8, '2024-10-05', '10:00', 'platelets', 'completed', 'Main Center - Corpus Christi', NULL),
        (9, '2025-01-12', '08:30', 'whole_blood', 'completed', 'Main Center - Lubbock', 'Frequent donor'),
        (10, '2024-12-18', '15:00', 'whole_blood', 'completed', 'Mobile Unit - McAllen', 'First time donor'),
        (11, '2024-11-03', '09:00', 'plasma', 'completed', 'Main Center - Midland', NULL),
        (12, '2025-01-20', '10:00', 'whole_blood', 'completed', 'Main Center - Tyler', NULL),
        (13, '2024-12-08', '11:30', 'double_red', 'completed', 'Main Center - Waco', NULL),
        (14, '2025-02-15', '09:00', 'whole_blood', 'scheduled', 'Main Center - Denton', 'Upcoming appointment'),
        (15, '2025-01-25', '14:30', 'platelets', 'completed', 'Main Center - Abilene', NULL),
        (16, '2025-02-20', '10:00', 'whole_blood', 'scheduled', 'Main Center - Austin', NULL)
    `);
    console.log('Donations seeded.');

    // ── Seed Screenings ────────────────────────────────────────────────

    console.log('Seeding screenings...');
    await client.query(`
      INSERT INTO screenings (donor_id, screening_date, temperature, blood_pressure_systolic, blood_pressure_diastolic, pulse, hemoglobin, weight, travel_history, medication_list, recent_illness, recent_surgery, recent_tattoo, pregnant, result, notes) VALUES
        (1, '2024-11-15', 98.4, 120, 78, 72, 15.2, 185.0, NULL, NULL, false, false, false, false, 'pass', NULL),
        (2, '2024-10-20', 98.6, 118, 76, 68, 13.8, 140.0, NULL, 'Multivitamin daily', false, false, false, false, 'pass', NULL),
        (3, '2024-12-01', 98.2, 122, 80, 74, 16.0, 170.0, NULL, NULL, false, false, false, false, 'pass', 'Excellent vitals'),
        (4, '2024-09-10', 98.7, 115, 72, 66, 13.5, 135.0, NULL, 'Birth control', false, false, false, false, 'pass', NULL),
        (5, '2025-01-05', 98.5, 128, 82, 70, 17.1, 200.0, NULL, NULL, false, false, false, false, 'pass', NULL),
        (6, '2024-08-25', 98.3, 110, 70, 64, 12.8, 125.0, NULL, NULL, false, false, false, false, 'pass', 'Hemoglobin slightly above minimum'),
        (7, '2024-11-28', 98.8, 130, 84, 76, 15.5, 190.0, 'Domestic travel - California', NULL, false, false, false, false, 'pass', NULL),
        (8, '2024-10-05', 98.4, 116, 74, 70, 14.2, 145.0, NULL, 'Allergy medication', false, false, false, false, 'pass', NULL),
        (9, '2025-01-12', 98.6, 124, 78, 68, 16.5, 175.0, NULL, NULL, false, false, false, false, 'pass', 'Veteran donor'),
        (10, '2024-12-18', 98.9, 112, 72, 72, 13.2, 130.0, NULL, NULL, false, false, false, false, 'pass', 'First donation - nervous but healthy'),
        (11, '2024-11-03', 98.5, 126, 80, 74, 15.8, 180.0, NULL, 'Ibuprofen occasionally', false, false, false, false, 'pass', NULL),
        (12, '2025-01-20', 98.3, 118, 76, 66, 14.5, 155.0, NULL, NULL, false, false, false, false, 'pass', NULL),
        (13, '2024-12-08', 98.7, 132, 86, 78, 16.8, 195.0, NULL, NULL, false, false, false, false, 'pass', NULL),
        (14, '2024-09-30', 99.1, 114, 74, 80, 12.2, 120.0, NULL, NULL, true, false, false, false, 'fail', 'Low hemoglobin and mild fever'),
        (15, '2025-01-25', 98.4, 120, 78, 70, 17.0, 210.0, NULL, NULL, false, false, false, false, 'pass', NULL),
        (16, '2024-10-14', 98.6, 116, 74, 68, 13.9, 138.0, NULL, NULL, false, false, false, false, 'pass', NULL)
    `);
    console.log('Screenings seeded.');

    // ── Seed Deferrals ─────────────────────────────────────────────────

    console.log('Seeding deferrals...');
    await client.query(`
      INSERT INTO deferrals (donor_id, deferral_type, reason, deferral_date, end_date, status, notes) VALUES
        (6, 'temporary', 'Low hemoglobin (11.8 g/dL)', '2024-07-15', '2024-08-15', 'expired', 'Advised iron supplements'),
        (10, 'temporary', 'Recent cold/flu symptoms', '2024-11-01', '2024-11-15', 'expired', 'Had a mild cold'),
        (14, 'temporary', 'Low hemoglobin (12.2 g/dL)', '2024-09-30', '2024-10-30', 'expired', 'Borderline hemoglobin'),
        (4, 'temporary', 'Recent dental surgery', '2024-06-20', '2024-07-20', 'expired', 'Wisdom tooth extraction'),
        (8, 'temporary', 'Recent tattoo', '2024-05-10', '2024-08-10', 'expired', 'New tattoo on forearm'),
        (2, 'temporary', 'Recent travel to malaria-endemic area', '2024-03-01', '2025-03-01', 'active', 'Trip to sub-Saharan Africa'),
        (16, 'temporary', 'Pregnancy', '2024-04-01', '2025-01-01', 'expired', 'Expected delivery October 2024'),
        (1, 'temporary', 'Medication - Accutane', '2024-01-15', '2024-02-15', 'expired', 'Completed course'),
        (7, 'temporary', 'Blood pressure elevated (150/95)', '2024-09-01', '2024-10-01', 'expired', 'Referred to PCP'),
        (3, 'temporary', 'Recent vaccination - live virus', '2024-08-01', '2024-09-01', 'expired', 'MMR booster'),
        (12, 'temporary', 'Cold/flu with fever', '2024-12-20', '2025-01-03', 'expired', 'Flu symptoms resolved'),
        (5, 'temporary', 'Low iron - mild anemia', '2024-06-01', '2024-09-01', 'expired', 'Iron infusion completed'),
        (9, 'temporary', 'Recent piercing', '2024-07-01', '2024-10-01', 'expired', 'Ear piercing'),
        (11, 'temporary', 'Antibiotic course', '2024-10-15', '2024-10-29', 'expired', 'For sinus infection'),
        (13, 'permanent', 'History of Hepatitis B', '2024-01-01', NULL, 'active', 'Confirmed positive HBsAg'),
        (15, 'temporary', 'Recent surgery - knee replacement', '2024-04-15', '2025-04-15', 'active', 'Major surgery recovery')
    `);
    console.log('Deferrals seeded.');

    // ── Seed Collections ───────────────────────────────────────────────

    console.log('Seeding collections...');
    await client.query(`
      INSERT INTO collections (donor_id, donation_id, collection_type, bag_number, volume_ml, phlebotomist, station_number, start_time, end_time, status, notes) VALUES
        (1, 1, 'whole_blood', 'WB-2024-001', 470, 'Nurse Patricia Adams', 1, '2024-11-15 09:15:00', '2024-11-15 09:25:00', 'completed', NULL),
        (2, 2, 'whole_blood', 'WB-2024-002', 450, 'Nurse Robert King', 2, '2024-10-20 10:45:00', '2024-10-20 10:55:00', 'completed', NULL),
        (3, 3, 'platelets', 'PLT-2024-003', 300, 'Nurse Sandra Lee', 3, '2024-12-01 08:15:00', '2024-12-01 09:45:00', 'completed', 'Apheresis collection'),
        (4, 4, 'plasma', 'PLS-2024-004', 600, 'Nurse Maria Torres', 1, '2024-09-10 14:15:00', '2024-09-10 15:00:00', 'completed', NULL),
        (5, 5, 'double_red', 'DR-2024-005', 360, 'Nurse Patricia Adams', 2, '2025-01-05 11:15:00', '2025-01-05 11:45:00', 'completed', NULL),
        (6, 6, 'whole_blood', 'WB-2024-006', 465, 'Nurse James Wright', 1, '2024-08-25 09:45:00', '2024-08-25 09:55:00', 'completed', NULL),
        (7, 7, 'whole_blood', 'WB-2024-007', 480, 'Nurse Diana Scott', 3, '2024-11-28 13:15:00', '2024-11-28 13:25:00', 'completed', NULL),
        (8, 8, 'platelets', 'PLT-2024-008', 310, 'Nurse Sandra Lee', 2, '2024-10-05 10:15:00', '2024-10-05 11:45:00', 'completed', NULL),
        (9, 9, 'whole_blood', 'WB-2025-009', 475, 'Nurse Robert King', 1, '2025-01-12 08:45:00', '2025-01-12 08:55:00', 'completed', NULL),
        (10, 10, 'whole_blood', 'WB-2024-010', 440, 'Nurse Maria Torres', 2, '2024-12-18 15:15:00', '2024-12-18 15:27:00', 'completed', 'First time - slower flow rate'),
        (11, 11, 'plasma', 'PLS-2024-011', 580, 'Nurse James Wright', 3, '2024-11-03 09:15:00', '2024-11-03 10:00:00', 'completed', NULL),
        (12, 12, 'whole_blood', 'WB-2025-012', 460, 'Nurse Diana Scott', 1, '2025-01-20 10:15:00', '2025-01-20 10:25:00', 'completed', NULL),
        (13, 13, 'double_red', 'DR-2024-013', 350, 'Nurse Patricia Adams', 2, '2024-12-08 11:45:00', '2024-12-08 12:15:00', 'completed', NULL),
        (15, 15, 'platelets', 'PLT-2025-014', 290, 'Nurse Sandra Lee', 3, '2025-01-25 14:45:00', '2025-01-25 16:15:00', 'completed', NULL),
        (16, 16, 'whole_blood', 'WB-2024-015', 455, 'Nurse Robert King', 1, '2024-10-14 10:15:00', '2024-10-14 10:25:00', 'completed', NULL),
        (9, 9, 'whole_blood', 'WB-2024-016', 470, 'Nurse Diana Scott', 2, '2024-10-01 09:00:00', '2024-10-01 09:10:00', 'completed', 'Repeat donor')
    `);
    console.log('Collections seeded.');

    // ── Seed Blood Tests ───────────────────────────────────────────────

    console.log('Seeding blood tests...');
    await client.query(`
      INSERT INTO blood_tests (collection_id, bag_number, abo_type, rh_type, antibody_screen, hiv_test, hepatitis_b, hepatitis_c, syphilis_test, zika_test, wnv_test, test_date, tested_by, status) VALUES
        (1, 'WB-2024-001', 'O', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-11-15', 'Lab Tech Sarah Kim', 'completed'),
        (2, 'WB-2024-002', 'A', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-10-20', 'Lab Tech John Park', 'completed'),
        (3, 'PLT-2024-003', 'B', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-12-01', 'Lab Tech Sarah Kim', 'completed'),
        (4, 'PLS-2024-004', 'AB', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-09-10', 'Lab Tech Maria Ruiz', 'completed'),
        (5, 'DR-2024-005', 'O', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2025-01-05', 'Lab Tech John Park', 'completed'),
        (6, 'WB-2024-006', 'A', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-08-25', 'Lab Tech Sarah Kim', 'completed'),
        (7, 'WB-2024-007', 'B', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-11-28', 'Lab Tech Maria Ruiz', 'completed'),
        (8, 'PLT-2024-008', 'AB', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-10-05', 'Lab Tech John Park', 'completed'),
        (9, 'WB-2025-009', 'O', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2025-01-12', 'Lab Tech Sarah Kim', 'completed'),
        (10, 'WB-2024-010', 'A', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-12-18', 'Lab Tech Maria Ruiz', 'completed'),
        (11, 'PLS-2024-011', 'B', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-11-03', 'Lab Tech John Park', 'completed'),
        (12, 'WB-2025-012', 'O', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2025-01-20', 'Lab Tech Sarah Kim', 'completed'),
        (13, 'DR-2024-013', 'A', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-12-08', 'Lab Tech Maria Ruiz', 'completed'),
        (14, 'PLT-2025-014', 'O', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2025-01-25', 'Lab Tech John Park', 'completed'),
        (15, 'WB-2024-015', 'B', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-10-14', 'Lab Tech Sarah Kim', 'completed'),
        (16, 'WB-2024-016', 'O', 'positive', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', 'negative', '2024-10-01', 'Lab Tech Maria Ruiz', 'completed')
    `);
    console.log('Blood tests seeded.');

    // ── Seed Components ────────────────────────────────────────────────

    console.log('Seeding components...');
    await client.query(`
      INSERT INTO components (collection_id, component_type, bag_number, volume_ml, preparation_date, expiration_date, storage_temp, status, quality_check, processed_by) VALUES
        (1, 'Packed RBC', 'RBC-2024-001', 320, '2024-11-15', '2025-01-13', '1-6C', 'available', 'passed', 'Tech Amy Chen'),
        (1, 'FFP', 'FFP-2024-001', 150, '2024-11-15', '2025-11-15', '-18C or below', 'available', 'passed', 'Tech Amy Chen'),
        (2, 'Packed RBC', 'RBC-2024-002', 300, '2024-10-20', '2024-12-18', '1-6C', 'expired', 'passed', 'Tech Brian Okafor'),
        (2, 'FFP', 'FFP-2024-002', 140, '2024-10-20', '2025-10-20', '-18C or below', 'available', 'passed', 'Tech Brian Okafor'),
        (3, 'Platelets', 'PLT-C-2024-003', 300, '2024-12-01', '2024-12-06', '20-24C agitation', 'expired', 'passed', 'Tech Amy Chen'),
        (4, 'FFP', 'FFP-2024-004', 600, '2024-09-10', '2025-09-10', '-18C or below', 'available', 'passed', 'Tech Brian Okafor'),
        (5, 'Packed RBC', 'RBC-2025-005A', 180, '2025-01-05', '2025-03-05', '1-6C', 'available', 'passed', 'Tech Amy Chen'),
        (5, 'Packed RBC', 'RBC-2025-005B', 180, '2025-01-05', '2025-03-05', '1-6C', 'available', 'passed', 'Tech Amy Chen'),
        (6, 'Packed RBC', 'RBC-2024-006', 310, '2024-08-25', '2024-10-23', '1-6C', 'expired', 'passed', 'Tech Brian Okafor'),
        (7, 'Packed RBC', 'RBC-2024-007', 330, '2024-11-28', '2025-01-26', '1-6C', 'available', 'passed', 'Tech Amy Chen'),
        (7, 'Cryoprecipitate', 'CRYO-2024-007', 15, '2024-11-28', '2025-11-28', '-18C or below', 'available', 'passed', 'Tech Amy Chen'),
        (9, 'Packed RBC', 'RBC-2025-009', 325, '2025-01-12', '2025-03-12', '1-6C', 'available', 'passed', 'Tech Brian Okafor'),
        (9, 'FFP', 'FFP-2025-009', 150, '2025-01-12', '2026-01-12', '-18C or below', 'available', 'passed', 'Tech Brian Okafor'),
        (10, 'Packed RBC', 'RBC-2024-010', 290, '2024-12-18', '2025-02-15', '1-6C', 'available', 'passed', 'Tech Amy Chen'),
        (12, 'Packed RBC', 'RBC-2025-012', 310, '2025-01-20', '2025-03-20', '1-6C', 'available', 'passed', 'Tech Brian Okafor'),
        (12, 'FFP', 'FFP-2025-012', 145, '2025-01-20', '2026-01-20', '-18C or below', 'available', 'passed', 'Tech Brian Okafor')
    `);
    console.log('Components seeded.');

    // ── Seed Inventory ─────────────────────────────────────────────────

    console.log('Seeding inventory...');
    await client.query(`
      INSERT INTO inventory (component_id, blood_type, rh_factor, product_type, units_available, unit_number, collection_date, expiration_date, storage_location, temperature, status) VALUES
        (1, 'O', 'positive', 'Packed RBC', 5, 'INV-RBC-001', '2024-11-15', '2025-01-13', 'Refrigerator A-1', 4.0, 'available'),
        (2, 'O', 'positive', 'FFP', 3, 'INV-FFP-001', '2024-11-15', '2025-11-15', 'Freezer B-1', -20.0, 'available'),
        (4, 'A', 'positive', 'FFP', 4, 'INV-FFP-002', '2024-10-20', '2025-10-20', 'Freezer B-2', -20.0, 'available'),
        (5, 'B', 'positive', 'Platelets', 2, 'INV-PLT-001', '2024-12-01', '2024-12-06', 'Agitator C-1', 22.0, 'expired'),
        (6, 'AB', 'positive', 'FFP', 6, 'INV-FFP-003', '2024-09-10', '2025-09-10', 'Freezer B-3', -20.0, 'available'),
        (7, 'O', 'negative', 'Packed RBC', 8, 'INV-RBC-002', '2025-01-05', '2025-03-05', 'Refrigerator A-2', 4.0, 'available'),
        (10, 'B', 'negative', 'Packed RBC', 3, 'INV-RBC-003', '2024-11-28', '2025-01-26', 'Refrigerator A-3', 4.0, 'available'),
        (11, 'B', 'negative', 'Cryoprecipitate', 2, 'INV-CRYO-001', '2024-11-28', '2025-11-28', 'Freezer B-4', -20.0, 'available'),
        (12, 'O', 'positive', 'Packed RBC', 4, 'INV-RBC-004', '2025-01-12', '2025-03-12', 'Refrigerator A-1', 4.0, 'available'),
        (13, 'O', 'positive', 'FFP', 5, 'INV-FFP-004', '2025-01-12', '2026-01-12', 'Freezer B-1', -20.0, 'available'),
        (14, 'A', 'positive', 'Packed RBC', 3, 'INV-RBC-005', '2024-12-18', '2025-02-15', 'Refrigerator A-2', 4.0, 'available'),
        (15, 'O', 'positive', 'Packed RBC', 6, 'INV-RBC-006', '2025-01-20', '2025-03-20', 'Refrigerator A-3', 4.0, 'available'),
        (16, 'O', 'positive', 'FFP', 4, 'INV-FFP-005', '2025-01-20', '2026-01-20', 'Freezer B-2', -20.0, 'available'),
        (NULL, 'A', 'negative', 'Packed RBC', 2, 'INV-RBC-007', '2024-12-08', '2025-02-05', 'Refrigerator A-4', 4.0, 'available'),
        (NULL, 'AB', 'negative', 'FFP', 3, 'INV-FFP-006', '2024-10-05', '2025-10-05', 'Freezer B-5', -20.0, 'available'),
        (NULL, 'B', 'positive', 'Packed RBC', 4, 'INV-RBC-008', '2025-01-25', '2025-03-25', 'Refrigerator A-1', 4.0, 'available')
    `);
    console.log('Inventory seeded.');

    // ── Seed Orders ────────────────────────────────────────────────────

    console.log('Seeding orders...');
    await client.query(`
      INSERT INTO orders (hospital_name, hospital_contact, blood_type, rh_factor, product_type, units_requested, units_fulfilled, priority, needed_by, status, notes) VALUES
        ('St. David''s Medical Center', 'Dr. Helen Carter (512) 555-2001', 'O', 'positive', 'Packed RBC', 4, 4, 'routine', '2025-01-20', 'fulfilled', NULL),
        ('Memorial Hermann Hospital', 'Dr. James Wu (713) 555-2002', 'A', 'positive', 'Packed RBC', 3, 3, 'urgent', '2025-01-15', 'fulfilled', 'Scheduled surgery'),
        ('Baylor Scott & White', 'Dr. Patricia Stone (214) 555-2003', 'O', 'negative', 'Packed RBC', 6, 4, 'emergency', '2025-01-10', 'partial', 'Trauma patient - MVC'),
        ('Methodist Hospital', 'Dr. Robert Nguyen (210) 555-2004', 'B', 'positive', 'FFP', 2, 2, 'routine', '2025-01-25', 'fulfilled', NULL),
        ('Dell Children''s Hospital', 'Dr. Susan Baker (512) 555-2005', 'AB', 'positive', 'Platelets', 3, 0, 'urgent', '2025-02-01', 'pending', 'Pediatric oncology patient'),
        ('Texas Health Harris', 'Dr. Michael Pham (817) 555-2006', 'A', 'negative', 'Packed RBC', 2, 2, 'routine', '2025-01-18', 'fulfilled', NULL),
        ('University Medical Center', 'Dr. Lisa Chang (915) 555-2007', 'O', 'positive', 'Packed RBC', 5, 3, 'urgent', '2025-02-05', 'partial', 'Multiple surgeries scheduled'),
        ('Driscoll Children''s', 'Dr. Ana Reyes (361) 555-2008', 'B', 'negative', 'Packed RBC', 1, 1, 'routine', '2025-01-22', 'fulfilled', NULL),
        ('Covenant Medical Center', 'Dr. David Kim (806) 555-2009', 'O', 'negative', 'FFP', 3, 0, 'routine', '2025-02-10', 'pending', NULL),
        ('South Texas Health System', 'Dr. Maria Santos (956) 555-2010', 'A', 'positive', 'Cryoprecipitate', 4, 2, 'urgent', '2025-01-28', 'partial', 'DIC patient'),
        ('Midland Memorial Hospital', 'Dr. Kevin O''Brien (432) 555-2011', 'AB', 'negative', 'FFP', 2, 0, 'routine', '2025-02-15', 'pending', NULL),
        ('UT Health Tyler', 'Dr. Jennifer Adams (903) 555-2012', 'O', 'positive', 'Packed RBC', 3, 3, 'routine', '2025-01-30', 'fulfilled', NULL),
        ('Ascension Providence', 'Dr. Thomas Reed (254) 555-2013', 'B', 'positive', 'Platelets', 2, 0, 'routine', '2025-02-08', 'pending', NULL),
        ('Medical City Denton', 'Dr. Rachel Green (940) 555-2014', 'A', 'positive', 'Packed RBC', 4, 2, 'urgent', '2025-02-03', 'partial', 'Cardiac surgery'),
        ('Hendrick Health', 'Dr. William Frost (325) 555-2015', 'O', 'positive', 'FFP', 3, 3, 'routine', '2025-01-16', 'fulfilled', NULL),
        ('Seton Medical Center', 'Dr. Emily Tran (512) 555-2016', 'AB', 'positive', 'Packed RBC', 2, 0, 'emergency', '2025-02-12', 'pending', 'Post-partum hemorrhage')
    `);
    console.log('Orders seeded.');

    // ── Seed Transportation ────────────────────────────────────────────

    console.log('Seeding transportation...');
    await client.query(`
      INSERT INTO transportation (order_id, courier_name, vehicle_id, departure_time, arrival_time, origin, destination, temperature_log, status, chain_of_custody, notes) VALUES
        (1, 'Carlos Mendez', 'VAN-101', '2025-01-19 08:00:00', '2025-01-19 08:45:00', 'Central Blood Bank - Austin', 'St. David''s Medical Center', '4.0C,4.1C,4.0C,3.9C', 'delivered', 'Packed by: Tech Amy Chen -> Driver: Carlos Mendez -> Received by: Nurse Hall', NULL),
        (2, 'Angela Foster', 'VAN-102', '2025-01-14 06:30:00', '2025-01-14 10:00:00', 'Central Blood Bank - Austin', 'Memorial Hermann Hospital - Houston', '4.0C,4.2C,4.1C,4.0C,4.1C', 'delivered', 'Packed by: Tech Brian Okafor -> Driver: Angela Foster -> Received by: Dr. Wu', 'Long distance delivery'),
        (3, 'Marcus Johnson', 'VAN-103', '2025-01-10 02:15:00', '2025-01-10 05:30:00', 'Central Blood Bank - Austin', 'Baylor Scott & White - Dallas', '4.0C,4.0C,4.1C,4.0C', 'delivered', 'Emergency dispatch -> Driver: Marcus Johnson -> ER Staff', 'Emergency overnight delivery'),
        (4, 'Carlos Mendez', 'VAN-101', '2025-01-24 09:00:00', '2025-01-24 13:00:00', 'Central Blood Bank - Austin', 'Methodist Hospital - San Antonio', '-18.0C,-18.1C,-18.0C,-17.9C', 'delivered', 'Packed by: Tech Amy Chen -> Driver: Carlos Mendez -> Blood Bank Staff', 'FFP shipment - maintained frozen'),
        (6, 'Angela Foster', 'VAN-102', '2025-01-17 07:00:00', '2025-01-17 10:30:00', 'Central Blood Bank - Austin', 'Texas Health Harris - Fort Worth', '4.0C,4.1C,4.0C,4.0C', 'delivered', 'Standard chain of custody maintained', NULL),
        (7, 'Marcus Johnson', 'VAN-103', '2025-02-04 08:00:00', NULL, 'Central Blood Bank - Austin', 'University Medical Center - El Paso', '4.0C,4.1C', 'in_transit', 'Packed by: Tech Brian Okafor -> Driver: Marcus Johnson', 'Long haul - El Paso'),
        (8, 'Carlos Mendez', 'VAN-101', '2025-01-21 10:00:00', '2025-01-21 14:30:00', 'Central Blood Bank - Austin', 'Driscoll Children''s - Corpus Christi', '4.0C,4.0C,4.1C,4.0C', 'delivered', 'Standard chain of custody maintained', NULL),
        (10, 'Angela Foster', 'VAN-104', '2025-01-27 06:00:00', '2025-01-27 11:00:00', 'Central Blood Bank - Austin', 'South Texas Health System - McAllen', '-18.0C,-18.0C,-18.1C,-18.0C', 'delivered', 'Frozen product chain maintained', 'Cryo shipment'),
        (12, 'Marcus Johnson', 'VAN-103', '2025-01-29 08:30:00', '2025-01-29 12:00:00', 'Central Blood Bank - Austin', 'UT Health Tyler', '4.0C,4.1C,4.0C,4.0C', 'delivered', 'Standard chain of custody maintained', NULL),
        (14, 'Carlos Mendez', 'VAN-101', '2025-02-02 07:00:00', '2025-02-02 09:30:00', 'Central Blood Bank - Austin', 'Medical City Denton', '4.0C,4.1C,4.0C', 'delivered', 'Standard chain of custody maintained', 'Partial order - 2 of 4 units'),
        (15, 'Angela Foster', 'VAN-102', '2025-01-15 08:00:00', '2025-01-15 12:00:00', 'Central Blood Bank - Austin', 'Hendrick Health - Abilene', '-18.0C,-18.0C,-18.1C,-18.0C', 'delivered', 'Standard chain of custody maintained', NULL),
        (5, 'Marcus Johnson', 'VAN-103', '2025-02-01 09:00:00', NULL, 'Central Blood Bank - Austin', 'Dell Children''s Hospital - Austin', '22.0C,22.1C', 'pending', 'Awaiting platelet availability', 'Platelet order - pending fulfillment'),
        (9, 'Carlos Mendez', 'VAN-101', '2025-02-09 08:00:00', NULL, 'Central Blood Bank - Austin', 'Covenant Medical Center - Lubbock', NULL, 'pending', NULL, 'Scheduled for next week'),
        (11, 'Angela Foster', 'VAN-102', '2025-02-14 09:00:00', NULL, 'Central Blood Bank - Austin', 'Midland Memorial Hospital', NULL, 'pending', NULL, 'Scheduled delivery'),
        (13, 'Marcus Johnson', 'VAN-103', '2025-02-07 08:00:00', NULL, 'Central Blood Bank - Austin', 'Ascension Providence - Waco', NULL, 'pending', NULL, 'Platelet order pending'),
        (16, 'Carlos Mendez', 'VAN-104', '2025-02-11 06:00:00', NULL, 'Central Blood Bank - Austin', 'Seton Medical Center - Austin', NULL, 'pending', NULL, 'Emergency order - awaiting units')
    `);
    console.log('Transportation seeded.');

    // ── Seed Reactions ─────────────────────────────────────────────────

    console.log('Seeding reactions...');
    await client.query(`
      INSERT INTO reactions (donor_id, collection_id, reaction_type, severity, symptoms, onset_time, treatment, outcome, reported_by, status, follow_up_required, notes) VALUES
        (10, 10, 'Vasovagal', 'mild', 'Lightheadedness, pallor', '2024-12-18 15:25:00', 'Reclined position, cold compress, juice provided', 'resolved', 'Nurse Maria Torres', 'resolved', false, 'First-time donor, likely anxiety related'),
        (6, 6, 'Hematoma', 'mild', 'Bruising at venipuncture site', '2024-08-25 09:55:00', 'Pressure applied, ice pack', 'resolved', 'Nurse James Wright', 'resolved', false, 'Small hematoma, resolved within days'),
        (2, 2, 'Vasovagal', 'moderate', 'Dizziness, nausea, brief loss of consciousness', '2024-10-20 10:53:00', 'Trendelenburg position, ammonia inhalant, IV fluids', 'resolved', 'Nurse Robert King', 'resolved', true, 'Syncopal episode lasting ~10 seconds'),
        (7, 7, 'Nerve irritation', 'mild', 'Tingling sensation in arm', '2024-11-28 13:20:00', 'Needle repositioned, warm compress', 'resolved', 'Nurse Diana Scott', 'resolved', false, 'Tingling resolved after needle adjustment'),
        (1, 1, 'Vasovagal', 'mild', 'Mild dizziness', '2024-11-15 09:24:00', 'Rest, fluids', 'resolved', 'Nurse Patricia Adams', 'resolved', false, 'Brief episode, donor recovered quickly'),
        (4, 4, 'Citrate reaction', 'moderate', 'Tingling lips, numbness in fingers', '2024-09-10 14:50:00', 'Slowed collection rate, calcium supplements (Tums)', 'resolved', 'Nurse Maria Torres', 'resolved', false, 'Common with plasma donation'),
        (3, 3, 'Citrate reaction', 'mild', 'Mild tingling around mouth', '2024-12-01 09:30:00', 'Calcium tablets administered', 'resolved', 'Nurse Sandra Lee', 'resolved', false, 'Platelet apheresis - expected side effect'),
        (12, 12, 'Vasovagal', 'mild', 'Feeling faint, sweating', '2025-01-20 10:23:00', 'Reclined, cold compress, snacks', 'resolved', 'Nurse Diana Scott', 'resolved', false, NULL),
        (8, 8, 'Hematoma', 'moderate', 'Large bruise and swelling at site', '2024-10-05 11:50:00', 'Pressure, elevation, ice', 'resolved', 'Nurse Sandra Lee', 'resolved', true, 'Larger than typical hematoma, phone follow-up in 48hrs'),
        (5, 5, 'Vasovagal', 'mild', 'Lightheadedness post-donation', '2025-01-05 11:50:00', 'Extended observation, fluids', 'resolved', 'Nurse Patricia Adams', 'resolved', false, 'After double red - longer recovery expected'),
        (9, 16, 'Arterial puncture', 'moderate', 'Bright red blood, rapid flow, swelling', '2024-10-01 09:05:00', 'Immediate removal, firm pressure for 10 min, elevation', 'resolved', 'Nurse Diana Scott', 'resolved', true, 'Rare complication, monitored for 30 min after'),
        (11, 11, 'Allergic', 'mild', 'Localized hives near needle site', '2024-11-03 09:45:00', 'Antihistamine administered', 'resolved', 'Nurse James Wright', 'resolved', false, 'Possible reaction to antiseptic'),
        (15, 14, 'Vasovagal', 'severe', 'Loss of consciousness, seizure-like activity', '2025-01-25 15:30:00', 'Trendelenburg, airway management, IV fluids, EMS called', 'hospitalized', 'Nurse Sandra Lee', 'under_review', true, 'Transferred to ER for observation, discharged same day'),
        (16, 15, 'Delayed fatigue', 'mild', 'Extreme fatigue for 48 hours post-donation', '2024-10-16 00:00:00', 'Rest recommended, iron supplements', 'resolved', 'Self-reported', 'resolved', false, 'Phone follow-up completed'),
        (13, 13, 'Hematoma', 'mild', 'Minor bruising', '2024-12-08 12:20:00', 'Ice pack applied', 'resolved', 'Nurse Patricia Adams', 'resolved', false, 'Minimal bruising, no treatment needed'),
        (14, NULL, 'Allergic', 'moderate', 'Generalized urticaria after screening prep', '2024-09-30 14:10:00', 'Diphenhydramine 25mg oral, observation', 'resolved', 'Nurse Robert King', 'resolved', true, 'Allergic to latex gloves - noted in file')
    `);
    console.log('Reactions seeded.');

    // ── Seed Equipment ─────────────────────────────────────────────────

    console.log('Seeding equipment...');
    await client.query(`
      INSERT INTO equipment (equipment_name, equipment_type, serial_number, location, last_calibration, next_calibration, calibrated_by, calibration_status, maintenance_notes, manufacturer, model) VALUES
        ('Primary Blood Centrifuge', 'Centrifuge', 'CTF-2021-001', 'Processing Lab A', '2024-12-01', '2025-03-01', 'Tech Services Inc.', 'current', 'Operating within specifications', 'Beckman Coulter', 'Allegra X-15R'),
        ('Backup Blood Centrifuge', 'Centrifuge', 'CTF-2022-002', 'Processing Lab A', '2024-11-15', '2025-02-15', 'Tech Services Inc.', 'due_soon', 'Due for calibration', 'Beckman Coulter', 'Allegra X-15R'),
        ('Platelet Agitator Unit 1', 'Agitator', 'AGT-2020-001', 'Storage Room C', '2024-10-01', '2025-04-01', 'BioMed Solutions', 'current', NULL, 'Helmer Scientific', 'PF48i'),
        ('Platelet Agitator Unit 2', 'Agitator', 'AGT-2021-002', 'Storage Room C', '2024-10-01', '2025-04-01', 'BioMed Solutions', 'current', NULL, 'Helmer Scientific', 'PF48i'),
        ('Blood Bank Refrigerator A-1', 'Refrigerator', 'REF-2019-001', 'Storage Room A', '2024-11-01', '2025-05-01', 'CoolTech Maintenance', 'current', 'Temperature stable at 4.0C', 'Helmer Scientific', 'iLR245'),
        ('Blood Bank Refrigerator A-2', 'Refrigerator', 'REF-2020-002', 'Storage Room A', '2024-11-01', '2025-05-01', 'CoolTech Maintenance', 'current', NULL, 'Helmer Scientific', 'iLR245'),
        ('Plasma Freezer B-1', 'Freezer', 'FRZ-2020-001', 'Storage Room B', '2024-09-15', '2025-03-15', 'CoolTech Maintenance', 'current', 'Maintaining -20C consistently', 'Thermo Fisher', 'TSX3020FA'),
        ('Plasma Freezer B-2', 'Freezer', 'FRZ-2021-002', 'Storage Room B', '2024-09-15', '2025-03-15', 'CoolTech Maintenance', 'current', NULL, 'Thermo Fisher', 'TSX3020FA'),
        ('Blood Mixer Station 1', 'Blood Mixer', 'MIX-2022-001', 'Collection Room', '2024-12-15', '2025-06-15', 'Tech Services Inc.', 'current', NULL, 'Bioelettronica', 'Biomixer 321'),
        ('Blood Mixer Station 2', 'Blood Mixer', 'MIX-2022-002', 'Collection Room', '2024-12-15', '2025-06-15', 'Tech Services Inc.', 'current', NULL, 'Bioelettronica', 'Biomixer 321'),
        ('Hemoglobin Analyzer', 'Analyzer', 'HBA-2023-001', 'Screening Room', '2025-01-10', '2025-04-10', 'Lab Calibration Corp.', 'current', 'Recently serviced', 'HemoCue', 'Hb 801'),
        ('Blood Pressure Monitor 1', 'Monitor', 'BPM-2023-001', 'Screening Room', '2025-01-05', '2025-07-05', 'BioMed Solutions', 'current', NULL, 'Omron', 'HBP-1320'),
        ('Blood Pressure Monitor 2', 'Monitor', 'BPM-2023-002', 'Screening Room', '2025-01-05', '2025-07-05', 'BioMed Solutions', 'current', NULL, 'Omron', 'HBP-1320'),
        ('Transport Cooler Box 1', 'Transport Container', 'TCB-2023-001', 'Dispatch Area', '2024-08-01', '2025-02-01', 'CoolTech Maintenance', 'overdue', 'Calibration overdue - schedule ASAP', 'Credo Cube', 'Series 4000'),
        ('Cell Separator', 'Apheresis Machine', 'APH-2021-001', 'Collection Room', '2024-12-20', '2025-06-20', 'Manufacturer Service', 'current', 'Annual PM completed', 'Terumo BCT', 'Trima Accel'),
        ('Digital Thermometer Probe', 'Thermometer', 'THM-2024-001', 'Processing Lab A', '2025-01-15', '2025-04-15', 'Lab Calibration Corp.', 'current', 'NIST traceable', 'Fluke', '1524')
    `);
    console.log('Equipment seeded.');

    // ── Seed Staff ─────────────────────────────────────────────────────

    console.log('Seeding staff...');
    await client.query(`
      INSERT INTO staff (name, role, email, phone, certification_type, certification_number, certification_date, expiration_date, status, department, supervisor) VALUES
        ('Patricia Adams', 'Registered Nurse', 'p.adams@bloodbank.com', '(512) 555-3001', 'RN License', 'RN-TX-45892', '2023-06-01', '2025-06-01', 'active', 'Collections', 'Dr. Helen Carter'),
        ('Robert King', 'Registered Nurse', 'r.king@bloodbank.com', '(512) 555-3002', 'RN License', 'RN-TX-51234', '2023-08-15', '2025-08-15', 'active', 'Collections', 'Dr. Helen Carter'),
        ('Sandra Lee', 'Apheresis Specialist', 's.lee@bloodbank.com', '(512) 555-3003', 'ASCP Certification', 'ASCP-78234', '2022-11-01', '2025-11-01', 'active', 'Collections', 'Dr. Helen Carter'),
        ('Maria Torres', 'Registered Nurse', 'm.torres@bloodbank.com', '(512) 555-3004', 'RN License', 'RN-TX-48901', '2024-01-10', '2026-01-10', 'active', 'Collections', 'Dr. Helen Carter'),
        ('James Wright', 'Phlebotomist', 'j.wright@bloodbank.com', '(512) 555-3005', 'CPT Certification', 'CPT-34567', '2023-09-01', '2025-09-01', 'active', 'Collections', 'Patricia Adams'),
        ('Diana Scott', 'Phlebotomist', 'd.scott@bloodbank.com', '(512) 555-3006', 'CPT Certification', 'CPT-34890', '2024-03-15', '2026-03-15', 'active', 'Collections', 'Patricia Adams'),
        ('Sarah Kim', 'Medical Laboratory Technologist', 's.kim@bloodbank.com', '(512) 555-3007', 'ASCP-MLT', 'MLT-89123', '2023-04-01', '2025-04-01', 'active', 'Laboratory', 'Dr. Michael Pham'),
        ('John Park', 'Medical Laboratory Technologist', 'j.park@bloodbank.com', '(512) 555-3008', 'ASCP-MLT', 'MLT-89456', '2023-07-20', '2025-07-20', 'active', 'Laboratory', 'Dr. Michael Pham'),
        ('Maria Ruiz', 'Medical Laboratory Technologist', 'm.ruiz@bloodbank.com', '(512) 555-3009', 'ASCP-MLT', 'MLT-89789', '2024-02-01', '2026-02-01', 'active', 'Laboratory', 'Dr. Michael Pham'),
        ('Amy Chen', 'Blood Bank Technologist', 'a.chen@bloodbank.com', '(512) 555-3010', 'ASCP-BB', 'BB-56123', '2023-10-01', '2025-10-01', 'active', 'Processing', 'Dr. Lisa Chang'),
        ('Brian Okafor', 'Blood Bank Technologist', 'b.okafor@bloodbank.com', '(512) 555-3011', 'ASCP-BB', 'BB-56456', '2024-01-15', '2026-01-15', 'active', 'Processing', 'Dr. Lisa Chang'),
        ('Dr. Helen Carter', 'Medical Director', 'h.carter@bloodbank.com', '(512) 555-3012', 'MD License', 'MD-TX-12345', '2023-01-01', '2025-12-31', 'active', 'Administration', NULL),
        ('Carlos Mendez', 'Transportation Coordinator', 'c.mendez@bloodbank.com', '(512) 555-3013', 'CDL Class B', 'CDL-TX-78901', '2024-05-01', '2026-05-01', 'active', 'Logistics', 'Dr. Helen Carter'),
        ('Angela Foster', 'Courier', 'a.foster@bloodbank.com', '(512) 555-3014', 'CDL Class B', 'CDL-TX-79234', '2024-06-15', '2026-06-15', 'active', 'Logistics', 'Carlos Mendez'),
        ('Marcus Johnson', 'Courier', 'm.johnson@bloodbank.com', '(512) 555-3015', 'CDL Class B', 'CDL-TX-79567', '2024-07-01', '2026-07-01', 'active', 'Logistics', 'Carlos Mendez'),
        ('Rebecca Torres', 'Quality Assurance Specialist', 'r.torres@bloodbank.com', '(512) 555-3016', 'ASQ-CQA', 'CQA-23456', '2023-11-01', '2025-11-01', 'active', 'Quality', 'Dr. Helen Carter')
    `);
    console.log('Staff seeded.');

    // ── Seed Drives ────────────────────────────────────────────────────

    console.log('Seeding drives...');
    await client.query(`
      INSERT INTO drives (drive_name, organization, location, address, drive_date, start_time, end_time, coordinator, goal_units, collected_units, volunteers_needed, volunteers_confirmed, status, equipment_list, notes) VALUES
        ('UT Austin Spring Drive', 'University of Texas at Austin', 'Gregory Gymnasium', '2101 Speedway, Austin, TX 78712', '2025-03-15', '09:00', '16:00', 'Patricia Adams', 50, 0, 10, 6, 'planned', 'Mobile unit, 8 beds, refreshment station', 'Annual spring drive'),
        ('Dell Technologies Drive', 'Dell Technologies', 'Dell HQ Campus', '1 Dell Way, Round Rock, TX 78682', '2025-02-28', '10:00', '15:00', 'Sandra Lee', 40, 38, 8, 8, 'completed', 'Mobile unit, 6 beds, refreshment station', 'Great corporate participation'),
        ('St. Edward''s University', 'St. Edward''s University', 'Recreation & Convocation Center', '3001 S Congress Ave, Austin, TX 78704', '2025-03-22', '09:00', '14:00', 'Robert King', 30, 0, 6, 4, 'planned', 'Mobile unit, 5 beds', NULL),
        ('Austin City Hall Drive', 'City of Austin', 'Austin City Hall Atrium', '301 W 2nd St, Austin, TX 78701', '2024-12-10', '08:00', '15:00', 'Maria Torres', 35, 32, 8, 8, 'completed', 'Mobile unit, 6 beds, refreshment station', 'Successful holiday drive'),
        ('Samsung Austin Drive', 'Samsung Austin Semiconductor', 'Samsung Campus', '12100 Samsung Blvd, Austin, TX 78754', '2025-01-18', '09:00', '14:00', 'James Wright', 45, 41, 10, 9, 'completed', 'Mobile unit, 8 beds, refreshment station', 'High participation rate'),
        ('Cedar Park Community', 'Cedar Park Community Center', 'Cedar Park Rec Center', '1435 Main St, Cedar Park, TX 78613', '2025-04-05', '10:00', '15:00', 'Diana Scott', 25, 0, 5, 2, 'planned', 'Mobile unit, 4 beds', 'First drive at this location'),
        ('H-E-B Corporate Drive', 'H-E-B', 'H-E-B Headquarters', '646 S Main Ave, San Antonio, TX 78204', '2024-11-20', '08:00', '16:00', 'Patricia Adams', 60, 55, 12, 12, 'completed', '2 mobile units, 12 beds, refreshment station', 'Largest corporate drive of the quarter'),
        ('Texas State University', 'Texas State University', 'LBJ Student Center', '601 University Dr, San Marcos, TX 78666', '2025-04-12', '09:00', '15:00', 'Robert King', 35, 0, 7, 0, 'planned', 'Mobile unit, 6 beds', NULL),
        ('Fort Hood Military Drive', 'US Army Fort Hood', 'Fort Hood Community Center', 'Battalion Ave, Fort Hood, TX 76544', '2024-10-15', '07:00', '16:00', 'Sandra Lee', 75, 72, 15, 15, 'completed', '2 mobile units, 14 beds, refreshment station', 'Outstanding military support'),
        ('Round Rock Medical', 'Baylor Scott & White', 'BS&W Round Rock Campus', '300 University Blvd, Round Rock, TX 78665', '2025-02-14', '09:00', '14:00', 'Maria Torres', 30, 27, 6, 6, 'completed', 'Mobile unit, 5 beds', 'Valentine''s Day theme'),
        ('Apple Campus Drive', 'Apple Inc.', 'Apple Austin Campus', '12545 Riata Vista Cir, Austin, TX 78727', '2025-03-08', '10:00', '15:00', 'James Wright', 40, 0, 8, 5, 'planned', 'Mobile unit, 6 beds, refreshment station', NULL),
        ('Pflugerville Fire Dept', 'City of Pflugerville', 'Fire Station #3', '1601 Pfennig Ln, Pflugerville, TX 78660', '2024-09-28', '08:00', '13:00', 'Diana Scott', 20, 18, 4, 4, 'completed', 'Mobile unit, 4 beds', 'Community heroes drive'),
        ('ACC Highland Campus', 'Austin Community College', 'ACC Highland', '6101 Highland Campus Dr, Austin, TX 78752', '2025-04-20', '09:00', '15:00', 'Patricia Adams', 30, 0, 6, 0, 'planned', 'Mobile unit, 5 beds', 'End of semester drive'),
        ('NXP Semiconductors', 'NXP Semiconductors', 'NXP Austin Campus', '6501 W William Cannon Dr, Austin, TX 78735', '2025-01-25', '09:00', '14:00', 'Robert King', 35, 33, 7, 7, 'completed', 'Mobile unit, 6 beds', NULL),
        ('Holiday Blood Drive', 'Central Blood Bank', 'Main Center - Austin', '1500 Red River St, Austin, TX 78701', '2024-12-23', '08:00', '17:00', 'Sandra Lee', 40, 28, 8, 6, 'completed', 'In-house, 8 stations', 'Holiday season - lower turnout expected'),
        ('Tesla Giga Texas', 'Tesla Inc.', 'Giga Texas Factory', '13101 Harold Green Rd, Austin, TX 78725', '2025-05-10', '08:00', '16:00', 'Maria Torres', 80, 0, 16, 0, 'planned', '2 mobile units, 14 beds, refreshment station', 'Major corporate partnership')
    `);
    console.log('Drives seeded.');

    // ── Seed Rewards ───────────────────────────────────────────────────

    console.log('Seeding rewards...');
    await client.query(`
      INSERT INTO rewards (donor_id, reward_type, points, milestone, description, earned_date, redeemed, redeemed_date, status) VALUES
        (1, 'donation_milestone', 100, '5 Donations', 'Thank you for 5 lifetime donations!', '2024-06-15', true, '2024-07-01', 'redeemed'),
        (3, 'donation_milestone', 200, '10 Donations', 'Double-digit donor! 10 donations reached.', '2024-09-01', false, NULL, 'active'),
        (5, 'donation_milestone', 300, '15 Donations', 'Silver donor status - 15 donations!', '2025-01-05', false, NULL, 'active'),
        (9, 'donation_milestone', 500, '20 Donations', 'Gold donor status - 20 donations!', '2025-01-12', false, NULL, 'active'),
        (1, 'points_earned', 50, NULL, 'Points for whole blood donation', '2024-11-15', false, NULL, 'active'),
        (2, 'points_earned', 50, NULL, 'Points for whole blood donation', '2024-10-20', false, NULL, 'active'),
        (3, 'points_earned', 75, NULL, 'Points for platelet donation (bonus)', '2024-12-01', false, NULL, 'active'),
        (5, 'points_earned', 100, NULL, 'Points for double red donation (bonus)', '2025-01-05', false, NULL, 'active'),
        (7, 'referral_bonus', 25, NULL, 'Referred a new donor', '2024-11-01', true, '2024-12-01', 'redeemed'),
        (9, 'loyalty_bonus', 150, NULL, 'Annual loyalty bonus for consistent donations', '2025-01-01', false, NULL, 'active'),
        (12, 'donation_milestone', 50, '5 Donations', 'Thank you for 5 lifetime donations!', '2024-08-20', true, '2024-09-15', 'redeemed'),
        (13, 'donation_milestone', 200, '10 Donations', 'Double-digit donor!', '2024-10-10', false, NULL, 'active'),
        (15, 'donation_milestone', 250, '10 Donations', 'Double-digit donor! Plus loyalty bonus.', '2024-12-01', false, NULL, 'active'),
        (10, 'first_donation', 25, '1st Donation', 'Welcome gift for first donation!', '2024-12-18', true, '2024-12-18', 'redeemed'),
        (4, 'points_earned', 75, NULL, 'Points for plasma donation', '2024-09-10', false, NULL, 'active'),
        (16, 'first_donation', 25, '1st Donation', 'Welcome gift for first donation!', '2024-10-14', false, NULL, 'active')
    `);
    console.log('Rewards seeded.');

    console.log('\n========================================');
    console.log('Database seeding completed successfully!');
    console.log('========================================\n');

  } catch (err) {
    console.error('Seeding error:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
    process.exit(0);
  }
}

seed();
