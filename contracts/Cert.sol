// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

contract Cert {
    
  address admin;

  constructor() {
    admin = msg.sender;    
  }
  
  modifier onlyAdmin {
      require(msg.sender == admin, "Access Denied");
      _;
  }
  
  struct Certificate {
      string name;
      string course;
      string grade;
      string date;
      address student;
      string performance; // Comma separated scores (e.g., "90,85,95,70,88")
  }
  
  mapping (uint256 => Certificate) public Certificates;
  mapping (address => uint256[]) public userCertificates;

  event Issued(address indexed student, string course, uint256 id, string grade);
  
  function issue (
      uint256 _id,
      string memory _name,
      string memory _course,
      string memory _grade,
      string memory _date,
      address _student,
      string memory _performance) public onlyAdmin {
          Certificates[_id] = Certificate(_name, _course, _grade, _date, _student, _performance);
          userCertificates[_student].push(_id);
          emit Issued(_student, _course, _id, _grade);
      }

  function getCertificatesByAddress(address _user) public view returns (uint256[] memory) {
      return userCertificates[_user];
  }
}