import React, { useState, useEffect } from 'react';
import Card from './Card';
import { PiCellSignalHighBold } from "react-icons/pi";
import { PiBatteryVerticalMediumFill } from "react-icons/pi";
import { PiCellSignalLowFill } from "react-icons/pi";
import { TbUrgent } from "react-icons/tb";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { TbProgress } from "react-icons/tb";
import { FaPencil } from "react-icons/fa6";
import { GoStack } from "react-icons/go";
import { IoAdd } from "react-icons/io5";
import { MdDisplaySettings } from "react-icons/md";
const priorityNames = {
  4: 'Urgent',
  3: 'High ',
  2: 'Medium',
  1: 'Low',
  0: 'No priority',
};

const priorityIcons = {
  4: { icon: <TbUrgent /> },
  3: { icon: <PiCellSignalHighBold /> },
  2: { icon: <PiBatteryVerticalMediumFill /> },
  1: { icon: <PiCellSignalLowFill /> },
  0: { icon: <HiOutlineDotsHorizontal /> },
};

const statusIcons = {
  'Todo': { icon: <FaPencil /> },
  'In progress': { icon: <TbProgress /> },  
  'Backlog': { icon: <GoStack /> },
};

const Board = () => {
  const defaultGroupingOption = 'status'; // Default grouping by status
  const defaultSortingOption = 'priority';
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [groupingOption, setGroupingOption] = useState(
    localStorage.getItem('groupingOption') || defaultGroupingOption
  );
  const [sortingOption, setSortingOption] = useState(
    localStorage.getItem('sortingOption') || defaultSortingOption
  );
  const [displayOptionsVisible, setDisplayOptionsVisible] = useState(false);

  const handleDisplayClick = () => {
    setDisplayOptionsVisible(!displayOptionsVisible);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.quicksell.co/v1/internal/frontend-assignment');
        const data = await response.json();
        setTickets(data.tickets);
        setUsers(data.users);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
      
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('groupingOption', groupingOption);
    localStorage.setItem('sortingOption', sortingOption);
  }, [groupingOption, sortingOption]);

  const handleGroupByChange = (event) => {
    setGroupingOption(event.ta  rget.value);
  };

  const handleSortByChange = (event) => {
    setSortingOption(event.target.value);
  };

  // Logic for grouping tickets based on selected option
  const groupTickets = () => {
    if (groupingOption === 'status') {
      return groupTicketsByStatus();
    } else if (groupingOption === 'user') {
      return groupTicketsByUser();
    } else if (groupingOption === 'priority') {
      return groupTicketsByPriority();
    }
    return {};
  };

  const groupTicketsByStatus = () => {
    const groups = {};
    tickets.forEach(ticket => {
      if (!groups[ticket.status]) {
        groups[ticket.status] = [];
      }
      groups[ticket.status].push(ticket);
    });
    return groups;
  };

  const groupTicketsByUser = () => {
    const groups = {};
    tickets.forEach(ticket => {
      const user = users.find(user => user.id === ticket.userId);
      if (user) {
        if (!groups[user.name]) {
          groups[user.name] = [];
        }
        groups[user.name].push(ticket);
      }
    });
    return groups;
  };

  const groupTicketsByPriority = () => {
    const groups = {};
    tickets.forEach(ticket => {
      const priorityName = priorityNames[ticket.priority];
      if (!groups[priorityName]) {
        groups[priorityName] = [];
      }
      groups[priorityName].push(ticket);
    });
    return groups;
  };

  // Logic for sorting tickets within each group
  const sortTickets = (groupedTickets) => {
    if (sortingOption === 'priority') {
      return sortTicketsByPriority(groupedTickets);
    } else if (sortingOption === 'title') {
      return sortTicketsByTitle(groupedTickets);
    }
    return groupedTickets;
  };

  const sortTicketsByPriority = (groupedTickets) => {
    const sortedTickets = {};
    Object.keys(groupedTickets).sort((a, b) => b - a).forEach(key => {
      sortedTickets[key] = groupedTickets[key].sort((a, b) => b.priority - a.priority);
    });
    return sortedTickets;
  };

  const sortTicketsByTitle = (groupedTickets) => {
    const sortedTickets = {};
    Object.keys(groupedTickets).forEach(key => {
      sortedTickets[key] = groupedTickets[key].sort((a, b) => a.title.localeCompare(b.title));
    });
    return sortedTickets;
  };

  const groupedTickets = groupTickets();
  const sortedAndGroupedTickets = sortTickets(groupedTickets);

  return (
    <div className="board">
      <div className="dropdown">
      <button onClick={handleDisplayClick}><MdDisplaySettings />&nbsp;Display:</button><br></br>
        {displayOptionsVisible && (
          <div>
            <select id="displayOption" value={groupingOption} onChange={handleGroupByChange}>
              <span> </span><option value="status">Status</option>
              <option value="user"> User</option>
              <option value="priority">Priority</option>
            </select>
            <br></br>
            <select id="sortingOption" value={sortingOption} onChange={handleSortByChange}>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        )}
      </div>

      {Object.entries(sortedAndGroupedTickets).map(([group, groupTickets]) => (
  <div key={group} className="column">
  <div style={{ display: 'flex', alignItems: 'center' }}>
  <h3>{group} {groupTickets.length}</h3>
  <div style={{ marginLeft: '140px' }}>
    <IoAdd />&nbsp;&nbsp;&nbsp;<HiOutlineDotsHorizontal />
  </div>
</div>

    {groupTickets.map(ticket => (
      <div key={ticket.id} className="ticket">
        {/* Conditionally render icons based on the selected grouping option */}
        {groupingOption === 'priority' && priorityIcons[ticket.priority] && (
          <div>
            <span className="priority-icon">{priorityIcons[ticket.priority].icon}</span>
            <span>{priorityIcons[ticket.priority].name}</span>
          </div>
        )}
        {groupingOption === 'status' && statusIcons[ticket.status] && (
          <div>
            <span className="status-icon">{statusIcons[ticket.status].icon}</span>
            <span>{ticket.status}</span>
          </div>
        )}
        <Card ticket={ticket} />
      </div>
    ))}
  </div>
))}
    </div>
  );
};

export default Board;
