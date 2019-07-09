import React from 'react';
import Lockouts from '../lockout/lockouts';
import Returns from '../lockout/returns';
import { CreateLockout } from '../lockout/lockoutForm';
import { CreateReturn } from '../lockout/returnForm';
import { Card, Col, Row, Button, Modal } from 'antd';
import * as firebase from 'firebase';
import { app } from '../config';


class Resident extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lockoutState: [],
            returnState: [],
            modalVisibleOne: false,
            modalVisibleTwo: false,
        }

        this.addLockout = this.addLockout.bind(this);
        this.addReturn = this.addReturn.bind(this);
    }

    componentDidMount = e => {
        this.db = firebase.database();
        this.listenForChange();
    }

    listenForChange = e => {
        this.db.ref('residents/' + this.props.id + '/lockouts').on('child_added', snapshot => {
            let lockout = {
                key: snapshot.key,
                checkoutType: snapshot.val().checkoutType,
                checkoutItem: snapshot.val().checkoutItem,
                checkoutTime: snapshot.val().checkoutTime,
                checkoutBy: snapshot.val().checkoutBy,
            }

            let lockouts = this.state.lockoutState;
            lockouts.push(lockout);

            this.setState({
                lockoutState: lockouts
            });
        })

        this.db.ref('residents/' + this.props.id + '/returns').on('child_added', snapshot => {
            let returnItem = {
                key: snapshot.key,
                checkinTime: snapshot.val().checkinTime,
                checkinBy: snapshot.val().checkinBy,
            }

            let returnItems = this.state.returnState;
            returnItems.push(returnItem);

            this.setState({
                returnState: returnItems
            });
        })
    }


    openFormOne = e => {
        this.setState({
            modalVisibleOne: true,
        });
    }

    openFormTwo = e => {
        this.setState({
            modalVisibleTwo: true,
        });
    }

    onCancel = e => {
        this.setState({
            modalVisibleOne: false,
            modalVisibleTwo: false,
        });
    }

    addLockout = e => {
        firebase.database().ref('residents/' + this.props.id + '/lockouts').push({
            checkoutType: e.checkoutType,
            checkoutItem: e.checkoutItemPrefix + ' ' + e.checkoutItemCode,
            checkoutTime: e.checkoutTime.format('HH:mm MM/DD/YY'),
            checkoutBy: e.checkoutBy,
        })
        this.onCancel()
    }

    addReturn = e => {
        firebase.database().ref('residents/' + this.props.id + '/returns').push({
            checkinTime: e.checkinTime.format('HH:mm MM/DD/YY'),
            checkinBy: e.checkinBy,
        })
        this.onCancel()
    }

    render() {
        return (
            <Col span={24}>
                <Card>
                    <Row>
                        <Col span={6}>
                            {this.props.data.name}
                        </Col>
                        <Col span={12}>
                            {this.props.data.email}
                        </Col>
                        <Col span={6}>
                            {this.props.data.roomNumber}
                        </Col>
                    </Row>
                    <Row>
                        {
                            this.state.lockoutState.length === 0 ?
                                <div>no lockouts yet</div>
                                :
                                <div>
                                    <Col span={16}>
                                        <Lockouts data={this.state.lockoutState} />
                                    </Col>
                                    <Col span={8}>
                                        {
                                            this.state.returnState.length === this.state.lockoutState.length ?
                                                <Returns data={this.state.returnState} /> :
                                                this.state.returnState.length === 0 ?
                                                    <div>
                                                        <Button onClick={this.openFormTwo} type='secondary'>
                                                            Checkin Card
                                                    </Button>
                                                        <Modal
                                                            title='Checkin Card'
                                                            centered
                                                            visible={this.state.modalVisibleTwo}
                                                            onCancel={this.onCancel}
                                                            footer={null}>
                                                            <CreateReturn onSubmit={this.addReturn} onCancel={this.onCancel} />
                                                        </Modal>
                                                    </div>
                                                    :
                                                    <div>
                                                        <Returns data={this.state.returnState} />
                                                        <Button onClick={this.openFormTwo} type='secondary'>
                                                            Checkin Card
                                                        </Button>
                                                        <Modal
                                                            title='Checkin Card'
                                                            centered
                                                            visible={this.state.modalVisibleTwo}
                                                            onCancel={this.onCancel}
                                                            footer={null}>
                                                            <CreateReturn onSubmit={this.addReturn} onCancel={this.onCancel} />
                                                        </Modal>
                                                    </div>
                                        }
                                    </Col>
                                </div>
                        }
                    </Row>
                    <Row>
                        <Button onClick={this.openFormOne} type='primary'>
                            Checkout Card
                    </Button>
                        <Modal
                            title='Checkout Card'
                            centered
                            visible={this.state.modalVisibleOne}
                            onCancel={this.onCancel}
                            footer={null}>
                            <CreateLockout onSubmit={this.addLockout} onCancel={this.onCancel} />
                        </Modal>
                    </Row>
                </Card>
            </Col>
        );
    }
}

export default Resident;