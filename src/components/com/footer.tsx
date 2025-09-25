import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

export default function Footer() {
    return (
        <Box
            component="footer"
            class="footer"
        >
            <Container maxWidth="md">
                <Typography variant="body2">
                    Copyright @2024 Equilibrium Games All Rights Reserved.
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <a
                        href="https://www.equilibrium-games.com/terms-and-conditions-games.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3f51b5', textDecoration: 'none', marginRight: 16 }}
                    >
                        Marketplace Terms & Conditions
                    </a>
                    <a
                        href="https://www.equilibrium-games.com/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3f51b5', textDecoration: 'none', marginRight: 16 }}
                    >
                        Privacy Policy
                    </a>
                    <a
                        href="https://www.equilibrium-games.com/docs/whitepaper.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3f51b5', textDecoration: 'none' }}
                    >
                        Whitepaper (PDF)
                    </a>
                </Box>
            </Container>
        </Box>
    );
}