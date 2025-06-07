import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../css/ManagerProfile.css';
import {SolarSettingsBoldDuotone} from "./Icons/SolarSettingsBoldDuotone";
import {UimSchedule} from "./Icons/UimSchedule";
import {FluentPeopleTeam20Filled} from "./Icons/Team";
import {UimClockNine} from "./Icons/UimClockNine"; // Using UimClockNine as a placeholder for Clients icon
import {useSocket} from '../utils';
//import ManagerSchedule from "./ManagerSchedule/ManagerSchedule";
//import ManagerSettings from "./ManagerSettings";
//import EmployeeListPage from "./EmployeeListPage";
//import ManagerClientCompaniesPage from "./ManagerClientCompaniesPage"; // Add this import

const ManagerProfile = ({name = "Joe's Caffe"}) => {
    const navigate = useNavigate(); // Initialize useNavigate
    const socket = useSocket();
    // const [showSettings, setShowSettings] = useState(false); // Already removed
    // const [showSchedule, setShowSchedule] = useState(false); // Already removed
    // const [showWorkers, setShowWorkers] = useState(false); // Already removed
    // const [showClientsDirectory, setShowClientsDirectory] = useState(false); // Remove this state

    const handleSettingsClick = () => {
        navigate('/manager-settings');
        // setShowSchedule(false); // Already removed
        //setShowWorkers(false);
       // setShowClientsDirectory(false);
    };

    const handleScheduleClick = () => {
        navigate('/manager-schedule');
       // setShowSettings(false);
       // setShowWorkers(false);
       // setShowClientsDirectory(false);
    };

    const handleWorkersClick = () => {
        navigate('/employeeListPage');
        // setShowSettings(false); // Already removed
        // setShowSchedule(false); // Already removed
        // setShowClientsDirectory(false);
    };

    const handleClientsDirectoryClick = () => {
        navigate('/manager-clients');
        // setShowSettings(false); // Already removed
        // setShowSchedule(false); // Already removed
        // setShowWorkers(false); // Already removed
    };

    const handleJobManagementClick = () => {
        navigate('/manager-jobs');
        // Ensure other submenu states are false if they are rendered within this component
       // setShowSettings(false);
       // setShowSchedule(false);
       // setShowWorkers(false);
        // setShowClientsDirectory(false);
    };

 return (
        <div className="full-page">
            <div className="manager-profile">
                <div className="profile-header">{name}' works management</div>

                <div className="menu">
                    <div className="icon-wrapper" onClick={handleSettingsClick}>
                        <SolarSettingsBoldDuotone className="icon" style={{width: '5em', height: '5em'}}/>
                        <br/>
                        Settings
                    </div>

                    <div className="icon-wrapper" onClick={handleScheduleClick}>
                        <UimSchedule className="icon" style={{width: '5em', height: '5em'}}/>
                        <br/>
                        Schedule
                    </div>

                    <div className="icon-wrapper" onClick={handleWorkersClick}>
                        <FluentPeopleTeam20Filled className="icon" style={{width: '5em', height: '5em'}}/>
                        <br/>
                        Workers
                    </div>

                    <div className="icon-wrapper" onClick={handleClientsDirectoryClick}>
                        <UimClockNine className="icon" style={{width: '5em', height: '5em'}}/>
                        <br/>
                        Clients Directory
                    </div>

                    <div className="icon-wrapper" onClick={handleJobManagementClick}>
                        <UimSchedule className="icon" style={{width: '5em', height: '5em'}}/>
                        <br/>
                        Job Management
                    </div>
                </div>
            </div>

        
        </div>
    );
};

export default ManagerProfile;