import * as React from 'react';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import CreateIcon from '@mui/icons-material/Create';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SearchIcon from '@mui/icons-material/Search';

interface BottomTabsProps {
    value: number;
    onChange: (val: number) => void;
}

const BottomTabs: React.FC<BottomTabsProps> = ({ value, onChange }) => {
    return (
        <Box sx={{ width: '100%' }}>
            <BottomNavigation
                showLabels
                value={value}
                onChange={(_e, newValue) => onChange(newValue)}
                style={{ backgroundColor: '#14141410', color: 'white' }}
                  
                
                
               
            >
                <BottomNavigationAction label="crear" icon={<CreateIcon />} sx={{color:"white"}} />

                <BottomNavigationAction label="donar" icon={<VolunteerActivismIcon />} sx={{color:"white"}} />
                <BottomNavigationAction label="votar" icon={<HowToVoteIcon />} sx={{color:"white"}} />
                <BottomNavigationAction label="revisar" icon={<SearchIcon />} sx={{color:"white"}} />
            </BottomNavigation>
        </Box>
    );
};

export default BottomTabs;