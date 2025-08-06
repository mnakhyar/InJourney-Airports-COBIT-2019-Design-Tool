
import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const InstructionPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Welcome to the COBIT® Governance Design Tool</h2>
            <p className="mt-4 text-lg text-gray-600">
                This interactive application is designed to guide you through the process of creating a tailored
                I&T (Information & Technology) governance system for your enterprise, based on the COBIT® 2019 framework.
            </p>

            <Card title="How to Use This Tool" description="Follow these steps to design your governance system." >
                <div className="space-y-4 text-gray-700">
                    <p>
                        <strong>1. Navigate Using the Sidebar:</strong> Use the navigation menu on the left to select a Design Factor you wish to work on. The factors are grouped into two main stages: "Initial Scope" and "Scope Refinement".
                    </p>
                    <p>
                        <strong>2. Provide Your Input:</strong> On each Design Factor page, you will find an "Input Section". Use the sliders and controls to enter values that best reflect your enterprise's context.
                    </p>
                    <p>
                        <strong>3. View Immediate Results:</strong> As you provide input, the "Output Section" on the same page will immediately update to show you how that single factor influences the priority of the 40 COBIT Governance and Management Objectives. This includes a data table and a radar chart for quick visualization.
                    </p>
                    <p>
                        <strong>4. Review Summaries:</strong> After completing the factors in a stage, visit the corresponding "Summary" page (e.g., "Step 2 Summary") to see the combined results.
                    </p>
                    <p>
                        <strong>5. Conclude Your Design:</strong> The "Final Summary (Canvas)" page provides the ultimate, consolidated view based on all your inputs. Here, you can make manual adjustments, see recommended capability levels, and print or save your final report.
                    </p>
                </div>
                 <div className="mt-8 text-center">
                    <Button onClick={() => navigate('/design-factor/df1')} variant="primary">
                        Get Started with Enterprise Strategy (DF1) &rarr;
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default InstructionPage;
