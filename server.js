const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Data file path (JSON-based storage - like a simple database)
const dataFilePath = path.join(__dirname, 'appointments.json');

// Initialize data file if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([], null, 2));
    console.log('Created new appointments data file');
}

// Helper functions to read/write data
function readAppointments() {
    try {
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading appointments:', error);
        return [];
    }
}

function writeAppointments(appointments) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(appointments, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing appointments:', error);
        return false;
    }
}

console.log('Hospital Appointment Backend initialized!');

// API Routes

// Get all appointments (for admin/viewing)
app.get('/api/appointments', (req, res) => {
    try {
        const appointments = readAppointments();
        // Sort by created_at descending (newest first)
        appointments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        res.json({ success: true, data: appointments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single appointment by booking reference
app.get('/api/appointments/:reference', (req, res) => {
    try {
        const appointments = readAppointments();
        const appointment = appointments.find(apt => apt.booking_reference === req.params.reference);
        if (appointment) {
            res.json({ success: true, data: appointment });
        } else {
            res.status(404).json({ success: false, message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new appointment
app.post('/api/appointments', (req, res) => {
    try {
        const {
            fullName,
            email,
            phone,
            age,
            gender,
            doctorName,
            specialization,
            appointmentDate,
            appointmentTime
        } = req.body;

        // Validation
        if (!fullName || !email || !phone || !age || !gender || !doctorName || !specialization || !appointmentDate || !appointmentTime) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Generate booking reference
        const bookingReference = 'HAB-' + Date.now().toString(36).toUpperCase();

        // Read existing appointments
        const appointments = readAppointments();

        // Create new appointment object
        const newAppointment = {
            id: Date.now(),
            booking_reference: bookingReference,
            full_name: fullName,
            email: email,
            phone: phone,
            age: parseInt(age),
            gender: gender,
            doctor_name: doctorName,
            specialization: specialization,
            appointment_date: appointmentDate,
            appointment_time: appointmentTime,
            created_at: new Date().toISOString()
        };

        // Add to appointments array
        appointments.push(newAppointment);

        // Save to file
        if (writeAppointments(appointments)) {
            res.status(201).json({
                success: true,
                message: 'Appointment booked successfully!',
                data: {
                    id: newAppointment.id,
                    bookingReference
                }
            });
        } else {
            res.status(500).json({ success: false, message: 'Failed to save appointment' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete appointment
app.delete('/api/appointments/:id', (req, res) => {
    try {
        const appointments = readAppointments();
        const initialLength = appointments.length;
        
        const filteredAppointments = appointments.filter(apt => apt.id !== parseInt(req.params.id));
        
        if (filteredAppointments.length < initialLength) {
            writeAppointments(filteredAppointments);
            res.json({ success: true, message: 'Appointment deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Appointment not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Export appointments to CSV (can be opened in Excel)
app.get('/api/export', (req, res) => {
    try {
        const appointments = readAppointments();
        appointments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Create CSV format
        const headers = ['Booking Reference', 'Full Name', 'Email', 'Phone', 'Age', 'Gender', 'Doctor', 'Specialization', 'Date', 'Time', 'Created At'];
        const csvRows = [headers.join(',')];
        
        appointments.forEach(apt => {
            const row = [
                apt.booking_reference,
                `"${apt.full_name}"`,
                apt.email,
                apt.phone,
                apt.age,
                apt.gender,
                `"${apt.doctor_name}"`,
                apt.specialization,
                apt.appointment_date,
                apt.appointment_time,
                apt.created_at
            ];
            csvRows.push(row.join(','));
        });
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=appointments.csv');
        res.send(csvRows.join('\n'));
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve the main HTML file for all other routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'hospital.html'));
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'hospital.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Data file: ${dataFilePath}`);
    console.log(`Export appointments to Excel: http://localhost:${PORT}/api/export`);
});
