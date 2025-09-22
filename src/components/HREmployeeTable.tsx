import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Mail, Phone } from "lucide-react";

const recentEmployees = [
  {
    name: "Sarah Johnson",
    email: "sarah.j@company.com",
    department: "Engineering",
    position: "Senior Developer",
    status: "Active",
    joinDate: "2024-01-15",
    avatar: "/placeholder.svg"
  },
  {
    name: "Michael Chen",
    email: "michael.c@company.com", 
    department: "Marketing",
    position: "Marketing Manager",
    status: "Active",
    joinDate: "2024-02-01",
    avatar: "/placeholder.svg"
  },
  {
    name: "Emma Williams",
    email: "emma.w@company.com",
    department: "HR",
    position: "HR Specialist",
    status: "On Leave",
    joinDate: "2023-11-20",
    avatar: "/placeholder.svg"
  },
  {
    name: "David Rodriguez", 
    email: "david.r@company.com",
    department: "Finance",
    position: "Financial Analyst",
    status: "Active",
    joinDate: "2024-01-08",
    avatar: "/placeholder.svg"
  },
  {
    name: "Lisa Thompson",
    email: "lisa.t@company.com",
    department: "Sales",
    position: "Sales Representative",
    status: "Active", 
    joinDate: "2024-02-15",
    avatar: "/placeholder.svg"
  }
];

const HREmployeeTable = () => {
  return (
    <Card className="bg-gradient-card border-border shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Recent Employees</CardTitle>
          <Button variant="outline">View All</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentEmployees.map((employee, index) => (
              <TableRow key={index} className="hover:bg-accent">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{employee.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-foreground">{employee.department}</span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{employee.position}</span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={employee.status === "Active" ? "default" : "secondary"}
                    className={employee.status === "Active" ? "bg-success text-success-foreground" : ""}
                  >
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{employee.joinDate}</span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default HREmployeeTable;